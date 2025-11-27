"use client";
import React, { useState, useEffect, useRef } from "react";
import { useGetAllMoodQuery } from "@/Redux/features/mood/moodApi";
import { updateMood } from "@/Redux/features/mood/moodSlice";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import SvgIcon from "@/CommonComponent/SVG/SvgIcon";
import data from "@emoji-mart/data";
import { init } from "emoji-mart";
import DataTable from "react-data-table-component";
import Loader from "@/Components/Loader";

const EmotionsTable = ({ session }) => {
  // Receive session as a prop
  const router = useRouter();
  const dispatch = useDispatch();
  const [page, setPage] = useState(1);
  const [moods, setMoods] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const tableRef = useRef(null);
  const currentUser = session?.user?._id;

  // Initialize emoji data
  useEffect(() => {
    init({ data });
  }, []);

  // Fetch moods data for the current user with pagination
  const {
    data: moodData,
    isLoading,
    isFetching,
  } = useGetAllMoodQuery(
    { userId: currentUser, page, limit: 10 },
    { skip: !currentUser, refetchOnMountOrArgChange: true }
  );

  // Clear mood data if the user changes to avoid showing cached data
  useEffect(() => {
    if (currentUser) {
      setMoods([]); // Reset moods on user change
    }
  }, [currentUser]);

  useEffect(() => {
    if (moodData?.moods?.length) {
      const sortedMoodData = [...moodData.moods].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      setMoods((prevMoods) => [...prevMoods, ...sortedMoodData]);
    } else if (moodData) {
      setHasMore(false);
    }
  }, [moodData]);

  const fetchMoreMoods = () => {
    if (!isFetching && hasMore) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const handleScroll = () => {
    const table = tableRef?.current?.children[0];
    if (table) {
      const { scrollTop, scrollHeight, clientHeight } = table;
      if (scrollTop + clientHeight >= scrollHeight - 5 && hasMore) {
        fetchMoreMoods();
      }
    }
  };

  useEffect(() => {
    const tableElement = tableRef?.current?.children[0];
    tableElement?.addEventListener("scroll", handleScroll);
    return () => tableElement?.removeEventListener("scroll", handleScroll);
  }, [hasMore, isFetching]);

  const handleEditMood = (singleMood) => {
    dispatch(updateMood(singleMood));
    router.push(`/user/journaling-feature/${singleMood._id}`);
  };

  const columns = [
    {
      name: "Mood",
      cell: (row) => (
        <div style={{ fontSize: "1.5em", textAlign: "center" }}>
          {row.emoji}
        </div>
      ),
      width: "40px", // Reduced width
      compact: true, // Makes the column more compact
    },
    {
      name: "Date",
      selector: (row) =>
        new Intl.DateTimeFormat("en-US", {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
          timeZone: "UTC",
        }).format(new Date(row.date)),
      width: "120px", // Slightly smaller than before
      compact: true,
      style: { textAlign: "center" },
    },
    {
      name: "Notes",
      cell: (row) => <div className="py-1">{row.notes}</div>,
      wrap: true,
      grow: 4,
      minWidth: "450px",
    },
    {
      name: "Action",
      cell: (row, index) =>
        index < 7 ? (
          <div role="button" onClick={() => handleEditMood(row)}>
            <SvgIcon className="feather" iconId="edit" />
          </div>
        ) : null,
      width: "70px",
    },
  ];

  if (isLoading) return <Loader />;

  return (
    <div className="d-flex flex-column align-items-center" ref={tableRef}>
      <DataTable
        columns={columns}
        data={moods}
        fixedHeader
        fixedHeaderScrollHeight="400px"
        highlightOnHover
        striped
        persistTableHead
        responsive
      />
      {hasMore && isFetching && (
        <span className="text-center mt-1">Loading More...</span>
      )}
    </div>
  );
};

export default EmotionsTable;
