import { Form, Input, InputGroup, InputGroupText } from "reactstrap";
import { SearchAnything } from "../../../Constant";
import { ChangeEvent, useEffect, useState } from "react";
import { MenuList, ProviderMenuList } from "../../../Data/Layout/Sidebar";
import SVG from "../../../CommonComponent/SVG";
import ResponsiveSearchList from "./ResponsiveSearchList";

const SearchInput = ({ userRole }) => {
  const [arr, setArr] = useState([]);
  const [searchedWord, setSearchedWord] = useState("");
  const [searchedArray, setSearchedArray] = useState([]);
  useEffect(() => {
    const suggestionArray = [];
    const getAllLink = (item, icon) => {
      if (item.children) {
        item.children.forEach((ele) => {
          getAllLink(ele, icon);
        });
      } else {
        suggestionArray.push({
          icon: icon,
          title: item.title,
          path: item.path || "",
        });
      }
    };
    (userRole === "Provider" ? ProviderMenuList : MenuList)?.forEach((item) => {
      item.Items?.forEach((child) => {
        getAllLink(child, child.icon);
      });
    });
    setArr(suggestionArray);
  }, []);
  const handleSearch = (e) => {
    if (!searchedWord) setSearchedWord("");
    setSearchedWord(e.target.value);
    let data = [...arr];
    let result = data.filter((item) =>
      item.title?.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setSearchedArray(result);
  };
  return (
    <div className="header-left d-xl-block d-none">
      <Form className="search-form mb-0">
        <InputGroup>
          <InputGroupText className="pe-0">
            <SVG className="search-bg svg-color" iconId="Search" />
          </InputGroupText>
          <Input
            type="text"
            placeholder={SearchAnything}
            onChange={(e) => handleSearch(e)}
            value={searchedWord}
          />
        </InputGroup>
        <div
          className={`Typeahead-menu custom-scrollbar ${
            searchedWord.length ? "is-open" : ""
          }`}
        >
          <ResponsiveSearchList
            searchedArray={searchedArray}
            setSearchedWord={setSearchedWord}
          />
        </div>
      </Form>
    </div>
  );
};

export default SearchInput;
