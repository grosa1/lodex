import { postEnrichment, putEnrichment, deleteEnrichment } from './enrichment';

describe('Enrichment controller', () => {
    describe('postEnrichment', () => {
        it('should call enrichment create repository method', async () => {
            const ctx = {
                request: { body: 'my enrichment' },
                enrichment: { create: jest.fn() },
            };

            await postEnrichment(ctx);

            expect(ctx.enrichment.create).toHaveBeenCalledWith('my enrichment');
        });

        it('should return result as body result', async () => {
            const ctx = {
                request: { body: 'my enrichment' },
                enrichment: {
                    create: jest.fn(() => 'enrichment create result'),
                },
            };

            await postEnrichment(ctx);

            expect(ctx.body).toBe('enrichment create result');
        });

        it("should set status 500 if there's not result", async () => {
            const ctx = {
                request: { body: 'my enrichment' },
                enrichment: {
                    create: jest.fn(() => null),
                },
            };

            await postEnrichment(ctx);

            expect(ctx.status).toBe(500);
        });
    });

    describe('putEnrichment', () => {
        it('should delete existing dataset data based on the enrichment name and update it', async () => {
            const ctx = {
                request: { body: 'my updated enrichment' },
                enrichment: {
                    findOneById: jest.fn(() => ({ name: 'NAME' })),
                    update: jest.fn(() => 'updated enrichment'),
                },
                dataset: { removeAttribute: jest.fn() },
            };

            await putEnrichment(ctx, 42);

            expect(ctx.enrichment.findOneById).toHaveBeenCalledWith(42);
            expect(ctx.dataset.removeAttribute).toHaveBeenCalledWith('NAME');
            expect(ctx.enrichment.update).toHaveBeenCalledWith(
                42,
                'my updated enrichment',
            );
            expect(ctx.body).toEqual('updated enrichment');
        });

        it('should return a 403 on error if an error occured', async () => {
            const ctx = {
                request: { body: 'my updated enrichment' },
                enrichment: {
                    findOneById: async () => {
                        throw new Error('ERROR!');
                    },
                },
            };

            await putEnrichment(ctx, 42);

            expect(ctx.status).toBe(403);
            expect(ctx.body).toEqual({ error: 'ERROR!' });
        });
    });

    describe('deleteEnrichment', () => {
        it('should delete existing dataset data based on the enrichment name and then delete it', async () => {
            const ctx = {
                enrichment: {
                    findOneById: jest.fn(() => ({ name: 'NAME' })),
                    delete: jest.fn(),
                },
                dataset: { removeAttribute: jest.fn() },
            };

            await deleteEnrichment(ctx, 42);

            expect(ctx.enrichment.findOneById).toHaveBeenCalledWith(42);
            expect(ctx.dataset.removeAttribute).toHaveBeenCalledWith('NAME');
            expect(ctx.enrichment.delete).toHaveBeenCalledWith(42);
            expect(ctx.body).toBe(true);
        });

        it('should return a 403 on error if an error occured', async () => {
            const ctx = {
                enrichment: {
                    findOneById: async () => {
                        throw new Error('ERROR!');
                    },
                    delete: jest.fn(),
                },
                dataset: { removeAttribute: jest.fn() },
            };

            await deleteEnrichment(ctx, 42);

            expect(ctx.status).toBe(403);
            expect(ctx.body).toEqual({ error: 'ERROR!' });
        });
    });
});