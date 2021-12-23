import progress from './progress';

export default async function transformAllDocument(
    count,
    findLimitFromSkip,
    insertBatch,
    transformer,
    datasetChunkExtractor = x => x,
    job,
) {
    let handled = 0;
    while (handled < count && (!job || (job && (await job.isActive())))) {
        const dataset = datasetChunkExtractor(
            await findLimitFromSkip(200, handled, {
                lodex_published: { $exists: false },
            }),
        );

        const transformedDataset = (
            await Promise.all(dataset.map(transformer))
        ).filter(x => x);
        await insertBatch(transformedDataset);
        progress.incrementProgress(
            transformedDataset.filter(({ subresourceId }) => !subresourceId)
                .length,
        );
        handled += dataset.length;
    }
}
