import { useCallback, useEffect, useState } from 'react';

import { UserVerified } from '../models/building';
import { apiGet } from '../api';

export function useUserVerifiedData(
    buildingId: number,
    preloadedData: UserVerified,
    isAuthenticated: boolean = false
): [UserVerified, (updatedBuilding: UserVerified) => void, () => void] {
    const [userVerifyData, setUserVerifyData] = useState<UserVerified>(preloadedData);
    const [isOld, setIsOld] = useState<boolean>(isAuthenticated && preloadedData == undefined);

    const fetchData = useCallback(async () => {
        if (!isAuthenticated || buildingId == undefined) {
            setUserVerifyData({});
            setIsOld(false);
            return;
        }
        try {
            const userVerify = await apiGet(`/api/buildings/${buildingId}/verify.json`);
            if (!userVerify || (userVerify as any).error) {
                setUserVerifyData({});
            } else {
                setUserVerifyData(userVerify);
            }
        } catch (error) {
            console.error(error);
            setUserVerifyData({});
        }
        setIsOld(false);
    }, [buildingId, isAuthenticated]);

    useEffect(() => {
        if (!isAuthenticated) {
            setUserVerifyData({});
            setIsOld(false);
        }
        return () => {
            setIsOld(true);
        };
    }, [buildingId, isAuthenticated]);

    useEffect(() => {
        if (isOld) {
            fetchData();
        }
    }, [isOld, fetchData]);

    return [userVerifyData, setUserVerifyData, () => setIsOld(true)];
}
