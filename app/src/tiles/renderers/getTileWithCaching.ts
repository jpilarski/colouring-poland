import { TileCache } from "../tileCache";
import { RendererFunction, Tile, TileParams } from "../types";

async function getTileWithCaching(
    tileParams: TileParams,
    dataParams: any,
    tileCache: TileCache,
    renderTile: RendererFunction
): Promise<Tile> {
    const tile = await tileCache.get(tileParams);
    if (tile != null) {
        return tile;
    }

    const im = await renderTile(tileParams, dataParams);
    try {
        await tileCache.put(im, tileParams);
    } catch (err) {
        console.error(err);
    }
    return im;
}

export {
    getTileWithCaching
};
