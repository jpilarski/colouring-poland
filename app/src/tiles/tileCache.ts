/**
 * Cache tiles (PNG images generated from database)
 *
 * Frequency of change:
 * - base layer tiles change rarely - on changes to underlying geometry table
 * - visualisation layer tiles change frequently - with almost any edit to the buildings table
 *
 * Cost of generation and storage:
 * - low zoom tiles are more expensive to render, containing more features from the database
 * - high zoom tiles are cheaper to rerender, and changes are more visible
 * - there are many more high zoom tiles than low: 4 tiles at zoom level n+1 for each tile
 *   at zoom level n
 *
 */

import { promises as fs } from 'fs';

import { BoundingBox, Tile, TileParams } from './types';
import { formatParams, getXYZ } from './util';

interface CacheLocation {
    /**
     * Cache file directory path
     */
    dir: string;

    /**
     * Full path to cache file
     */
    fname: string;
}

interface CacheDomain {
    /**
     * An array of tileset names to cache
     */
    tilesets: string[];

    /**
     * The lowest zoom level to cache
     */
    minZoom: number;

    /**
     * The highest zoom level to cache
     */
    maxZoom: number;

    /**
     * An array of scale factors to cache
     */
    scales: number[];
}

class TileCache {
    constructor(
        /** Base path in filesystem to store the cache */
        private basePath: string,
        /** Domain definition for the cache */
        private cacheDomain: CacheDomain,
        /** Function for defining custom caching rules (optional) */
        private shouldCacheFn?: (tileParams: TileParams) => boolean,
        /** Function for defining whether the tileset should be cleared when clearing cache for bounding box */
        private shouldBulkClearTilesetFn?: (tileset: string) => boolean
    ) { }

    async get(tileParams: TileParams): Promise<Buffer | null> {
        if (!this.shouldUseCache(tileParams)) {
            return null;
        }
        const location = this.cacheLocation(tileParams);
        try {
            const buf = await fs.readFile(location.fname);
            if (!buf || buf.length === 0) {
                await fs.unlink(location.fname).catch(() => {});
                return null;
            }
            return buf;
        } catch {
            return null;
        }
    }

    async put(im: Buffer, tileParams: TileParams): Promise<void> {
        if (!this.shouldUseCache(tileParams) || !im || im.length === 0) {
            return;
        }

        const location = this.cacheLocation(tileParams);
        const tempFname = `${location.fname}.${process.pid}.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`;
        try {
            await fs.writeFile(tempFname, im);
            await fs.rename(tempFname, location.fname);
        } catch (err: any) {
            if (err.code === 'ENOENT') {
                await fs.mkdir(location.dir, { recursive: true });
                await fs.writeFile(tempFname, im);
                await fs.rename(tempFname, location.fname);
            } else {
                await fs.unlink(tempFname).catch(() => {});
                throw err;
            }
        }
    }

    async remove(tileParams: TileParams): Promise<void> {
        const location = this.cacheLocation(tileParams);
        try {
            await fs.unlink(location.fname);
        } catch (err) { }
    }

    async removeAllAtBbox(bbox: BoundingBox): Promise<void> {
        const removePromises: Promise<void>[] = [];
        const maxCacheZoom = Math.min(this.cacheDomain.maxZoom, 18);
        for (const tileset of this.cacheDomain.tilesets) {
            if (!this.shouldBulkClearTileset(tileset)) continue;

            for (let z = this.cacheDomain.minZoom; z <= maxCacheZoom; z++) {
                const tileBounds = getXYZ(bbox, z);
                for (let x = tileBounds.minX; x <= tileBounds.maxX; x++) {
                    for (let y = tileBounds.minY; y <= tileBounds.maxY; y++) {
                        for (const scale of this.cacheDomain.scales) {
                            removePromises.push(this.remove({ tileset, z, x, y, scale }));
                        }
                    }
                }
            }
        }
        await Promise.all(removePromises);
    }

    private cacheLocation({ tileset, z, x, y, scale }: TileParams): CacheLocation {
        const dir = `${this.basePath}/${tileset}/${z}/${x}`;
        const scaleSuffix = scale === 1 ? '' : `@${scale}x`;
        const fname = `${dir}/${y}${scaleSuffix}.png`;
        return { dir, fname };
    }

    private shouldUseCache(tileParams: TileParams): boolean {
        return this.cacheDomain.tilesets.includes(tileParams.tileset) &&
            this.cacheDomain.minZoom <= tileParams.z &&
            this.cacheDomain.maxZoom >= tileParams.z &&
            this.cacheDomain.scales.includes(tileParams.scale) &&
            (this.shouldCacheFn == undefined || this.shouldCacheFn(tileParams));
    }

    private shouldBulkClearTileset(tileset: string): boolean {
        return this.shouldBulkClearTilesetFn == undefined || this.shouldBulkClearTilesetFn(tileset);
    }
}

export {
    TileCache
};
