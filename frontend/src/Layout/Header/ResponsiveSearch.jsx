import { Href } from "../../Constant";
import { FormGroup, Input } from "reactstrap";
import { useEffect, useState } from "react";
import { useAppDispatch } from "../../Redux/Hooks";
import { MenuList } from "../../Data/Layout/Sidebar";
import SearchSuggestionList from "./SearchSuggestionList";
import Link from "next/link";
import SVG from "../../CommonComponent/SVG";
import { getLinkItemsArray } from "../../Redux/Reducers/HeaderBookmarkSlice";

const ResponsiveSearch = () => {
  const [open, setOpen] = useState(false);
  const [arr, setArr] = useState([]);
  const [searchedWord, setSearchedWord] = useState("");
  const [searchedArray, setSearchedArray] = useState([]);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const suggestionArray = [];
    let num = 0;
    const getAllLink = (item, icon) => {
      if (item.children) {
        item.children.forEach((ele) => {
          getAllLink(ele, icon);
        });
      } else {
        num = num + 1;
        suggestionArray.push({
          icon: icon,
          title: item.title,
          path: item.path ? item.path : "",
          bookmarked: false,
          id: num,
        });
      }
    };
    MenuList?.forEach((item) => {
      item.Items?.forEach((child) => {
        getAllLink(child, child.icon);
      });
    });
    setArr(suggestionArray);
    dispatch(getLinkItemsArray(suggestionArray));
  }, []);

  const handleSearch = (e) => {
    if (!searchedWord) setSearchedWord("");
    setSearchedWord(e.target.value);
    let result = arr.filter((item) =>
      item.title?.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setSearchedArray(result);
  };
  return (
    <li className="serchinput d-xl-none d-flex">
      <Link className="search-mode" href={Href} onClick={() => setOpen(!open)}>
        <SVG className="svg-color" iconId="Search" />
      </Link>
      <FormGroup className={`search-form ${open ? "open" : ""}`}>
        <Input
          type="text"
          placeholder="Search here..."
          onChange={(e) => handleSearch(e)}
          value={searchedWord}
        />
        <div
          className={`Typeahead-menu w-100 custom-scrollbar ${
            searchedWord.length ? "is-open" : ""
          }`}
        >
          <SearchSuggestionList
            searchedArray={searchedArray}
            setSearchedWord={setSearchedWord}
          />
        </div>
      </FormGroup>
    </li>
  );
};

export default ResponsiveSearch;
