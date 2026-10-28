import {
    selectLatestRevisionId,
    selectBuildingEditHistory
} from '../../dataAccess/editHistory';
import { EditHistoryEntry } from '../../../frontend/models/edit-history-entry';

export async function getLatestRevisionId(): Promise<string> {
    return selectLatestRevisionId();
}

export async function getBuildingEditHistory(id: number): Promise<EditHistoryEntry[]> {
    return selectBuildingEditHistory(id);
}
