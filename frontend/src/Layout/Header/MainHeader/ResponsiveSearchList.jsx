import { useAppDispatch } from "../../../Redux/Hooks";
import { setResponsiveSearch } from "../../../Redux/Reducers/LayoutSlice";
import SVG from "../../../CommonComponent/SVG";
import Link from "next/link";

const ResponsiveSearchList = ({ searchedArray, setSearchedWord }) => {
  const dispatch = useAppDispatch();
  const handleSearch = () => {
    setSearchedWord("");
    dispatch(setResponsiveSearch());
  };
  return (
    <>
      {searchedArray?.map((item, index) => (
        <div className="ProfileCard u-cf" key={index}>
          <div className="ProfileCard-avatar">
            <SVG className="stroke-icon" iconId={item.icon} />
          </div>
          <div className="ProfileCard-details">
            <div className="ProfileCard-realName">
              <Link
                className="realname  w-auto d-flex justify-content-start gap-2"
                href={item.path}
                onClick={handleSearch}
              >
                {item.title}
              </Link>
            </div>
          </div>
        </div>
      ))}
      {!searchedArray?.length && <p>Opps!! There are no result found.</p>}
    </>
  );
};

export default ResponsiveSearchList;
