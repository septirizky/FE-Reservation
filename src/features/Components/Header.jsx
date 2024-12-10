import { useDispatch, useSelector } from "react-redux";
import { getBranchDetail } from "../Branch/branchSlice";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Loading } from "./Alert/Loading";
import { Error } from "./Alert/Error";
import { ArrowLeftIcon } from "@heroicons/react/16/solid";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";

export const Header = ({ onBack, onSearchChange }) => {
  const { BranchCode } = useParams();
  const dispatch = useDispatch();

  const branchDetails = useSelector((state) => state.branch.branchDetail);
  const status = useSelector((state) => state.branch.getBranchDetailStatus);
  const error = useSelector((state) => state.branch.error);

  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(getBranchDetail(BranchCode));
  }, [dispatch, BranchCode]);

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (onSearchChange) {
      onSearchChange(term);
    }
  };

  const toggleSearch = () => {
    if (isSearchVisible) {
      setSearchTerm("");
      if (onSearchChange) {
        onSearchChange("");
      }
    }
    setIsSearchVisible(!isSearchVisible);
  };

  const clearSearch = () => {
    setSearchTerm("");
    if (onSearchChange) {
      onSearchChange("");
    }
  };

  return (
    <>
      <Loading status={status} />
      <Error status={status} error={error} />
      <div className="bg-purple-900 text-white flex items-center p-4">
        <button onClick={onBack} className="mr-4">
          <ArrowLeftIcon className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-2xl font-bold flex-grow">
          {branchDetails?.BranchName || "Loading..."}
        </h1>
        {onSearchChange && (
          <button onClick={toggleSearch} className="flex rounded-xl bg-purple-800 px-4 py-1">
            <MagnifyingGlassIcon className="w-5 h-5 pt-1 text-white" />
            <h3 className="ml-2">Cari</h3>
          </button>
        )}
      </div>

      {isSearchVisible && onSearchChange && (
        <div className="relative p-4 bg-purple-800">
          <input
            type="text"
            placeholder="Cari menu..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full p-2 rounded-lg text-black"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      )}
    </>
  );
};
