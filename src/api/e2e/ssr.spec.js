import omit from 'lodash.omit';
import jwt from 'jsonwebtoken';
import { auth } from 'config';

import mongoClient from '../services/mongoClient';
import requestServer from './utils/requestServer';
import fixtures from './ssr.json';
import {
    connect,
    clear,
    loadFixtures,
    close,
} from '../../common/tests/fixtures';

const authentifiedHeader = {
    cookie: `lodex_token=${jwt.sign(
        {
            username: 'user',
            role: 'user',
        },
        auth.cookieSecret,
    )}`,
};

describe('ssr', () => {
    let server;

    beforeAll((done) => {
        server = requestServer();
        done();
    });

    beforeEach(async () => {
        await clear();
        await connect();
        await loadFixtures(fixtures);
    });

    describe('/', () => {
        let state;

        describe('authentified', () => {
            beforeEach(async () => {
                const response = await server
                    .get('/', authentifiedHeader)
                    .then(response => response.text());
                state = JSON.parse(
                    response.match(
                        /__PRELOADED_STATE__ = ([\s\S]*?);window.ISTEX_API_URL/,
                    )[1],
                );
            });

            it('should preload the dataset for home', () => {
                expect(state.dataset.dataset).toEqual([
                    {
                        uri: '1',
                        fullname: 'PEREGRIN.TOOK',
                        email: 'peregrin.took@shire.net',
                    },
                    {
                        uri: '2',
                        fullname: 'SAMSAGET.GAMGIE',
                        email: 'samsaget.gamgie@shire.net',
                    },
                    {
                        uri: '3',
                        fullname: 'BILBON.BAGGINS',
                        email: 'bilbon.saquet@shire.net',
                    },
                    {
                        uri: '4',
                        fullname: 'FRODO.BAGGINS',
                        email: 'frodo.saquet@shire.net',
                    },
                    {
                        uri: '5',
                        fullname: 'MERIADOC.BRANDYBUCK',
                        email: 'meriadoc.brandybuck@shire.net',
                    },
                ]);
            });

            it('should preload fields for home', () => {
                expect(state.fields.list).toEqual([
                    'uri',
                    'fullname',
                    'email',
                    'movie',
                    'author',
                ]);
                expect(Object.keys(state.fields.byName)).toEqual([
                    'uri',
                    'fullname',
                    'email',
                    'movie',
                    'author',
                ]);
            });

            it('should preload characteristics for home', () => {
                expect(
                    state.characteristic.characteristics.map(d =>
                        omit(d, '_id'),
                    ),
                ).toEqual([{ movie: 'LOTR', author: 'Peter Jackson' }]);
            });

            it('should not include token in state', () => {
                expect(state.user).toEqual({
                    token: null,
                });
            });
        });

        describe('not authentified', () => {
            beforeEach(async () => {
                const response = await server
                    .get('/')
                    .then(response => response.text());
                state = JSON.parse(
                    response.match(
                        /__PRELOADED_STATE__ = ([\s\S]*?);window.ISTEX_API_URL/,
                    )[1],
                );
            });

            it('should redirect to login', () => {
                expect(state.router.location.pathname).toBe('/login');
            });

            it('should not preload the dataset for home', () => {
                expect(state.dataset.dataset).toEqual([]);
            });

            it('should not preload fields for home', () => {
                expect(state.fields.list).toEqual([]);
                expect(Object.keys(state.fields.byName)).toEqual([]);
            });

            it('should not preload characteristics for home', () => {
                expect(state.characteristic.characteristics).toEqual([]);
            });

            it('should not preload exporters for home', () => {
                expect(state.export.exporters).toEqual([]);
            });

            it('should not include token in state', () => {
                expect(state.user).toEqual({
                    token: null,
                });
            });
        });
    });

    describe('/resource', () => {
        let state;

        describe('authentified', () => {
            beforeEach(async () => {
                const response = await server
                    .get('/resource?uri=1', authentifiedHeader)
                    .then(response => response.text());
                state = JSON.parse(
                    response.match(
                        /__PRELOADED_STATE__ = ([\s\S]*?);window.ISTEX_API_URL/,
                    )[1],
                );
            });

            it('should preload fields', () => {
                expect(state.fields.list).toEqual([
                    'uri',
                    'fullname',
                    'email',
                    'movie',
                    'author',
                ]);
                expect(Object.keys(state.fields.byName)).toEqual([
                    'uri',
                    'fullname',
                    'email',
                    'movie',
                    'author',
                ]);
            });

            it('should preload characteristics', () => {
                expect(
                    state.characteristic.characteristics.map(d =>
                        omit(d, '_id'),
                    ),
                ).toEqual([{ movie: 'LOTR', author: 'Peter Jackson' }]);
            });

            it('should preload resource', () => {
                expect(omit(state.resource.resource, '_id')).toEqual({
                    uri: '1',
                    versions: [
                        {
                            fullname: 'PEREGRIN.TOOK',
                            email: 'peregrin.took@shire.net',
                        },
                    ],
                });
            });

            it('should not include token in state', () => {
                expect(state.user).toEqual({
                    token: null,
                });
            });
        });

        describe('not authentified', () => {
            beforeEach(async () => {
                const response = await server
                    .get('/resource?uri=1')
                    .then(response => response.text());
                state = JSON.parse(
                    response.match(
                        /__PRELOADED_STATE__ = ([\s\S]*?);window.ISTEX_API_URL/,
                    )[1],
                );
            });

            it('should redirect to login', () => {
                expect(state.router.location.pathname).toEqual('/login');
            });

            it('should not preload fields', () => {
                expect(state.fields.list).toEqual([]);
                expect(Object.keys(state.fields.byName)).toEqual([]);
            });

            it('should not preload characteristics',  () => {
                expect(
                    state.characteristic.characteristics.map(d =>
                        omit(d, '_id'),
                    ),
                ).toEqual([]);
            });

            it('should not preload resource',  () => {
                expect(omit(state.resource.resource, '_id')).toEqual({});
            });

            it('should not include token in state', () => {
                expect(state.user).toEqual({
                    token: null,
                });
            });
        });
    });

    afterEach(async () => {
        await clear();
        await close();
    });

    afterAll(async () => {
        server.close();
        const db = await mongoClient();
        db.close();
    });
});
