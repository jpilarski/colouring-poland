import path from 'path';

import {
    DataExtractRow,
    selectAllDataExtracts,
    selectDataExtractById
} from '../dataAccess/dataExtract';

export interface DataExtract {
    extract_id: number;
    extracted_on: Date;
    download_path: string;
}

async function listDataExtracts(): Promise<DataExtract[]> {
    const extractRecords = await selectAllDataExtracts();
    if (!extractRecords) {
        return undefined;
    }
    return extractRecords.map(getDataExtractFromRow);
}

async function getDataExtractById(extractId: number): Promise<DataExtract> {
    const extractRecord = await selectDataExtractById(extractId);
    if (!extractRecord) {
        return undefined;
    }
    return getDataExtractFromRow(extractRecord);
}

function getDataExtractFromRow(er: DataExtractRow): DataExtract {
    return {
        extract_id: er.extract_id,
        extracted_on: er.extracted_on,
        download_path: getDownloadLinkForExtract(er)
    };
}

function getDownloadLinkForExtract(extract: DataExtractRow): string {
    const fileName = path.basename(extract.extract_path);
    return `/downloads/${fileName}`;
}

export {
    listDataExtracts,
    getDataExtractById
};
