import React, { useState, useEffect } from 'react';
import { useGetSevenDaySummaryMutation } from '@/Redux/features/AI/AIApi';
import { summaryParser } from '@/utils/helpers';
import { formatViewSummary } from '@/utils/AISummariesHelpers';

const SevenDaySummary = ({ patientId }) => {
    const [getSevenDaySummary, { data: sevenData, isLoading, isError, error }] = useGetSevenDaySummaryMutation();
    const [sevenDayData, setSevenDayData] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const sevenDaySummaryResponse = await getSevenDaySummary({ patientId });
                const sevenDayRawResponse = sevenDaySummaryResponse?.data?.data?.summary;
                const sevenDayCreatedAt = sevenDaySummaryResponse?.data?.data?.createdAt;

                if (sevenDayRawResponse) {
                    const sevenDayParsed = formatViewSummary(sevenDayRawResponse, sevenDayCreatedAt);
                    setSevenDayData(sevenDayParsed); // Set parsed data to state
                }
            } catch (error) {
                setSevenDayData('Failed to fetch data'); // Handle error in fetching data
            }
        };

        if (patientId) {
            fetchData();
        }
    }, [patientId]);

    return (
        <>
            {!isLoading ? (
                sevenDayData ? (
                    <div
                        className=""
                        dangerouslySetInnerHTML={{ __html: sevenDayData }}
                    ></div>
                ) : (
                    <div className="mt10 xl:mt-6">No Data Found.</div>
                )
            ) : (
                <i className="fa fa-spinner fa-spin"></i>
            )}
        </>
    );
};

export default SevenDaySummary;
