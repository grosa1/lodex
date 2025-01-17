import Koa from 'koa';
import route from 'koa-route';
import PDFDocument from 'pdfkit';
import fs from 'fs';

import _escapeRegExp from 'lodash.escaperegexp';

import moment from 'moment';
import {
    DATASET_TITLE,
    RESOURCE_DESCRIPTION,
    RESOURCE_DETAIL_1,
    RESOURCE_DETAIL_2,
    RESOURCE_DETAIL_3,
    RESOURCE_TITLE,
} from '../../../common/overview';
import { PDFExportOptions } from './displayConfig';

const PDF_MARGIN_LEFT = 70;
const PDF_IMAGE_TOP_POSITION = 50;
const PDF_IMAGE_WIDTH = 100;
const PDF_TITLE_TOP_POSITION = 90;
const PDF_TITLE_WITH_IMAGE_LEFT_POSITION = 180;

function getDateFromLocale(locale = 'fr') {
    moment.locale(locale);
    if (locale === 'fr') {
        return `Date de téléchargement : Le ${moment().format('LLL')}`;
    }
    return `Download date : ${moment().format('LLL')}`;
}

function getFont(index) {
    switch (index) {
        case 0:
            return 'Helvetica-Bold';
        default:
            return 'Helvetica';
    }
}

function getFontSize(index) {
    switch (index) {
        case 0:
            return 12;
        case 1:
            return 9;
        case 2:
            return 10;
        case 3:
            return 9;
        case 4:
            return 9;
        default:
            return 12;
    }
}

async function getExportedData(ctx) {
    const maxExportPDFSize =
        parseInt(ctx.request.query.maxExportPDFSize) || 1000;

    const match = _escapeRegExp(ctx.request.query.match) || null;

    // facets looks like  {"MwzR":["Multidisciplinary Sciences","Oncology"],"a2E3":["B"]}
    const facets = ctx.request.query.facets || null;

    // set facets to look like an array of key value pairs [{key: MwzR, value: "Multidisciplinary Sciences"}, {key: MwzR, value: "Oncology"}, {key:a2E3, value: "B"}]
    const facetsArray = facets
        ? Object.keys(JSON.parse(facets)).reduce((acc, key) => {
              const values = JSON.parse(facets)[key];
              return acc.concat(
                  values.map(value => ({
                      key,
                      value,
                  })),
              );
          }, [])
        : null;

    const fields = await ctx.field
        .find({
            overview: {
                $in: [
                    RESOURCE_TITLE,
                    RESOURCE_DETAIL_3,
                    RESOURCE_DESCRIPTION,
                    RESOURCE_DETAIL_1,
                    RESOURCE_DETAIL_2,
                ],
            },
        })
        .toArray();

    let searchableFields = [];
    if (match)
        searchableFields = await ctx.field
            .find({
                searchable: true,
            })
            .toArray();

    // sort by overview
    const sortedFields = fields.sort((a, b) => a.overview - b.overview);

    // place overview with value 6 at the second position
    const overview6Index = sortedFields.findIndex(
        field => field.overview === RESOURCE_DETAIL_3,
    );
    if (overview6Index !== -1) {
        const overview6 = sortedFields.splice(overview6Index, 1);
        sortedFields.splice(1, 0, overview6[0]);
    }

    // return field names to have a result like {name1:1, name2:1}
    const syndicatedFields = sortedFields.reduce((acc, field) => {
        acc[field.name] = 1;
        return acc;
    }, {});

    // FIlter only on lastVersion not null or empty object
    let publishedDataset = await ctx.publishedDataset
        .aggregate([
            {
                $addFields: {
                    lastVersion: { $last: '$versions' },
                },
            },
            {
                $match: {
                    // if facets is not null, filter resuls
                    ...(facetsArray && facetsArray.length
                        ? {
                              // Regroup same key facets in an $or (mongoDB query)
                              $and: facetsArray
                                  .reduce((acc, facet) => {
                                      const index = acc.findIndex(
                                          item => item.key === facet.key,
                                      );
                                      if (index === -1) {
                                          acc.push({
                                              key: facet.key,
                                              value: [facet.value],
                                          });
                                      } else {
                                          acc[index].value.push(facet.value);
                                      }
                                      return acc;
                                  }, [])
                                  .map(facet => ({
                                      $or: facet.value.map(value => ({
                                          [`lastVersion.${facet.key}`]: value,
                                      })),
                                  })),
                          }
                        : {}),
                },
            },
            {
                $project: {
                    lastVersion: syndicatedFields,
                    _id: 0,
                },
            },
            {
                $match: {
                    lastVersion: {
                        $ne: null,
                        // eslint-disable-next-line no-dupe-keys
                        $ne: {},
                    },
                    // if match is not null, search in searchable fields
                    ...(match
                        ? {
                              $or: [
                                  ...searchableFields.map(field => ({
                                      [`lastVersion.${field.name}`]: {
                                          // should match tot and be case insensitive
                                          $regex: new RegExp(match, 'i'),
                                      },
                                  })),
                              ],
                          }
                        : {}),
                },
            },
            { $limit: maxExportPDFSize },
        ])
        .toArray();

    // filter the dataset where lastVersion is not null or empty object
    publishedDataset = publishedDataset.filter(
        dataset =>
            dataset.lastVersion && Object.keys(dataset.lastVersion).length,
    );

    return [publishedDataset, syndicatedFields];
}

async function getPDFTitle(ctx, locale) {
    let configTitle =
        PDFExportOptions?.title?.[locale] || PDFExportOptions?.title?.['en'];

    if (configTitle) {
        return configTitle;
    }

    // get pubished data field who is dataset_title
    const datasetTitleField = await ctx.field
        .find({
            overview: DATASET_TITLE,
        })
        .toArray();

    // FIlter only on lastVersion not null or empty object
    let publishedCharacteristic = await ctx.publishedCharacteristic.findLastVersion();
    let publishedDatasetTitle =
        publishedCharacteristic[datasetTitleField[0]?.name];

    if (publishedDatasetTitle) {
        return publishedDatasetTitle;
    }

    return locale === 'fr' ? 'Données publiées' : 'Published data';
}

function renderHeader(doc, PDFTitle) {
    if (PDFExportOptions.logo) {
        try {
            // Set logo and title in the same line
            doc.image(
                `src/app/custom/${PDFExportOptions.logo}`,
                PDF_MARGIN_LEFT,
                PDF_IMAGE_TOP_POSITION,
                {
                    width: PDF_IMAGE_WIDTH,
                    align: 'left',
                },
            );
            doc.font('Helvetica-Bold')
                .fontSize(20)
                .text(
                    PDFTitle,
                    PDF_TITLE_WITH_IMAGE_LEFT_POSITION,
                    PDF_TITLE_TOP_POSITION,
                    {
                        align: 'center',
                    },
                );
        } catch (e) {
            console.error(e);

            doc.font('Helvetica-Bold')
                .fontSize(20)
                .text(PDFTitle, PDF_MARGIN_LEFT, PDF_TITLE_TOP_POSITION, {
                    align: 'center',
                });
        }
    } else {
        doc.font('Helvetica-Bold')
            .fontSize(20)
            .text(PDFTitle, PDF_MARGIN_LEFT, PDF_TITLE_TOP_POSITION, {
                align: 'center',
            });
    }

    doc.moveDown();
    doc.moveDown();
}

function renderDate(doc, locale) {
    // Add date of publication at right
    doc.font('Helvetica')
        .fontSize(12)
        // display date in a french readable format without toLocaleDateString because node imcompatible
        .text(getDateFromLocale(locale), { align: 'right' });

    doc.moveDown();

    doc.moveTo(PDF_MARGIN_LEFT, doc.y)
        .lineTo(540, doc.y)
        .lineWidth(2)
        .fillOpacity(0.8)
        .fillAndStroke(
            PDFExportOptions?.highlightColor || 'black',
            PDFExportOptions?.highlightColor || 'black',
        );
    doc.moveDown();
}

function renderData(doc, publishedDataset, syndicatedFields) {
    // We gonna iterate over the publishedDataset lastVersion. And for each field, we gonna add a line to the pdf
    publishedDataset.forEach((dataset, datasetIndex) => {
        Object.keys(syndicatedFields).forEach((key, index) => {
            const font = getFont(index);
            const fontSize = getFontSize(index);
            doc.font(font)
                .fontSize(fontSize)
                .fillColor('black')
                .text(
                    index === 0
                        ? `${datasetIndex + 1} - ${dataset.lastVersion[key]}`
                        : dataset.lastVersion[key],
                    PDF_MARGIN_LEFT,
                );
            if (index === 1 || index === 2) {
                doc.moveDown();
            }
        });
        // Add a line break
        doc.moveDown();
        doc.moveDown();
    });
}

function renderFooter(doc, locale) {
    if (!PDFExportOptions?.footer) {
        return;
    }

    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);
        doc.fontSize(6)
            .fillColor(PDFExportOptions?.highlightColor || 'black')
            .text(
                locale === 'fr'
                    ? PDFExportOptions?.footer['fr']
                    : PDFExportOptions?.footer['en'],
                PDF_MARGIN_LEFT,
                doc.page.height - 40,

                {
                    height: 45,
                    width: 460,
                    align: 'center',
                },
            );
    }
}

async function exportPDF(ctx) {
    try {
        const locale = ctx.request.query.locale;
        const [publishedDataset, syndicatedFields] = await getExportedData(ctx);
        const PDFTitle = await getPDFTitle(ctx, locale);

        // Create a document
        const doc = new PDFDocument({ bufferPages: true });

        // Pipe its output somewhere, like to a file or HTTP response
        doc.pipe(fs.createWriteStream('/tmp/publication.pdf'));

        renderHeader(doc, PDFTitle);
        renderDate(doc, locale);
        renderData(doc, publishedDataset, syndicatedFields);
        renderFooter(doc, locale);
        // Finalize PDF file
        doc.end();

        // set publication name with the current date
        ctx.set(
            'Content-disposition',
            `attachment; filename="publication_${new Date().toISOString()}.pdf"`,
        );
        ctx.set('Content-type', 'application/pdf');

        ctx.body = doc;
        // delete file
        fs.unlinkSync('/tmp/publication.pdf');

        // return pdf
        ctx.status = 200;
    } catch (e) {
        ctx.throw(500, e);
    }
}

const app = new Koa();
app.use(route.get('/', exportPDF));

export default app;
