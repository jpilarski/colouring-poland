import sharp from "sharp";

import { Tile } from "../types";

let blankTilePromise: Promise<Tile> | null = null;

function createBlankTile(): Promise<Tile> {
    if (!blankTilePromise) {
        blankTilePromise = sharp({
            create: {
                width: 1,
                height: 1,
                channels: 4,
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            }
        }).png().toBuffer();
    }
    return blankTilePromise;
}

export {
    createBlankTile
};
