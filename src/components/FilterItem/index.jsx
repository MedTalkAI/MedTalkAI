import React, { useState, useEffect, useRef } from "react";
import Style from "./FilterItem.module.css";

const FilterItem = ({
  filterName,
  filterOptions,
  selectedOptions,
  onChange,
}) => {
  const [expanded, setExpanded] = useState(false);
  const filterRef = useRef(null);

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const handleOptionClick = (option) => {
    if (selectedOptions.includes(option)) {
      onChange(selectedOptions.filter((item) => item !== option));
    } else {
      onChange([...selectedOptions, option]);
    }
  };

  const handleSelectAll = () => {
    onChange(filterOptions);
  };
  
  const handleClearSelection = () => {
    onChange([]);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setExpanded(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div ref={filterRef} className={Style.filterContainer}>
      <div
        className={`${Style.filterOption} ${
          selectedOptions.length > 0 ? Style.selected : ""
        }`}
        onClick={toggleExpanded}
      >
        <div className={Style.filterContent} onClick={toggleExpanded}>
          {selectedOptions.length > 0 ? selectedOptions[0] : filterName}
          {selectedOptions.length > 1 && (
            <div className={Style.filterQuantity}>
              +{selectedOptions.length -1}
            </div>
          )}
        </div>
        {expanded ? (
          <span className="material-symbols-outlined">expand_less</span>
        ) : selectedOptions.length > 0 ? (
          <span
            className="material-symbols-outlined"
            onClick={handleClearSelection}
          >
            close_small
          </span>
        ) : (
          <span className="material-symbols-outlined">expand_more</span>
        )}
      </div>
      {expanded && (
        <div className={Style.optionList}>
          <div onClick={handleSelectAll}>Select All</div>
          <div onClick={handleClearSelection}>Clear</div>
          {filterOptions.map((option) => (
            <label key={option} className={Style.checkboxLabel}>
              <input
                type="checkbox"
                checked={selectedOptions.includes(option)}
                onChange={() => handleOptionClick(option)}
                className={Style.checkbox}
              />
              {option}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterItem;
