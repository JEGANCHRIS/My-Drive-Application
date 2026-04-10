import React, { useState, useEffect } from "react";
import CustomSelect from "./CustomSelect";

function FilterBar({ files, setFiles, allFiles }) {
  const [filterType, setFilterType] = useState("all");
  const [filterPeople, setFilterPeople] = useState("all");
  const [filterDate, setFilterDate] = useState("all");
  const [people, setPeople] = useState([]);
  const [fileCategories, setFileCategories] = useState([]);

  // Define file categories
  const getFileCategory = (extension) => {
    const categories = {
      Images: [".jpg", ".jpeg", ".png", ".gif", ".svg", ".bmp", ".webp"],
      Documents: [".pdf", ".doc", ".docx", ".txt", ".rtf", ".odt"],
      Spreadsheets: [".xls", ".xlsx", ".csv", ".ods"],
      Presentations: [".ppt", ".pptx", ".odp"],
      Videos: [".mp4", ".avi", ".mov", ".wmv", ".flv", ".mkv"],
      Audio: [".mp3", ".wav", ".ogg", ".m4a", ".flac"],
      Code: [
        ".js",
        ".jsx",
        ".ts",
        ".tsx",
        ".py",
        ".java",
        ".html",
        ".css",
        ".json",
        ".xml",
      ],
      Archives: [".zip", ".rar", ".7z", ".tar", ".gz"],
      Other: [],
    };

    for (const [category, extensions] of Object.entries(categories)) {
      if (extensions.includes(extension.toLowerCase())) {
        return category;
      }
    }
    return "Other";
  };

  useEffect(() => {
    if (allFiles && allFiles.length > 0) {
      // Group files by category
      const categoriesMap = new Map();

      allFiles.forEach((file) => {
        if (file.extension) {
          const category = getFileCategory(file.extension);
          if (!categoriesMap.has(category)) {
            categoriesMap.set(category, []);
          }
          categoriesMap.get(category).push(file.extension);
        }
      });

      // Convert to array format for dropdown
      const categories = Array.from(categoriesMap.entries()).map(
        ([category, extensions]) => ({
          category,
          extensions: [...new Set(extensions)], // Unique extensions
          count: allFiles.filter(
            (f) => getFileCategory(f.extension) === category,
          ).length,
        }),
      );

      setFileCategories(categories);

      // Extract unique people
      const uniquePeople = [
        ...new Set(
          allFiles
            .filter((file) => file.createdBy?.email)
            .map((file) => file.createdBy.email),
        ),
      ];
      setPeople(uniquePeople);
    }
  }, [allFiles]);

  const applyFilters = () => {
    let filtered = [...allFiles];

    // Apply type filter (by category or specific extension)
    if (filterType !== "all") {
      if (filterType.startsWith("category_")) {
        // Filter by category
        const category = filterType.replace("category_", "");
        filtered = filtered.filter(
          (file) => getFileCategory(file.extension) === category,
        );
      } else {
        // Filter by specific extension
        filtered = filtered.filter(
          (file) =>
            file.extension &&
            file.extension.toLowerCase() === filterType.toLowerCase(),
        );
      }
    }

    // Apply people filter
    if (filterPeople !== "all") {
      filtered = filtered.filter(
        (file) => file.createdBy?.email === filterPeople,
      );
    }

    // Apply date filter
    if (filterDate !== "all") {
      const now = new Date();
      const today = new Date(now.setHours(0, 0, 0, 0));
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      const yearAgo = new Date();
      yearAgo.setFullYear(yearAgo.getFullYear() - 1);

      switch (filterDate) {
        case "today":
          filtered = filtered.filter(
            (file) => new Date(file.lastModified) >= today,
          );
          break;
        case "week":
          filtered = filtered.filter(
            (file) => new Date(file.lastModified) >= weekAgo,
          );
          break;
        case "month":
          filtered = filtered.filter(
            (file) => new Date(file.lastModified) >= monthAgo,
          );
          break;
        case "year":
          filtered = filtered.filter(
            (file) => new Date(file.lastModified) >= yearAgo,
          );
          break;
        case "before-year":
          filtered = filtered.filter(
            (file) => new Date(file.lastModified) < yearAgo,
          );
          break;
        default:
          break;
      }
    }

    setFiles(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [filterType, filterPeople, filterDate]);

  // Prepare options for CustomSelect components
  const typeOptions = [
    { value: "all", label: `All Types (${allFiles.length})` },
    ...(fileCategories.length > 0
      ? [
          {
            value: "group_categories",
            label: "📁 Categories",
            isGroupLabel: true,
            disabled: true,
          },
          ...fileCategories.map((cat) => ({
            value: `category_${cat.category}`,
            label: cat.category,
            count: cat.count,
          })),
          {
            value: "group_filetypes",
            label: "📄 File Types",
            isGroupLabel: true,
            disabled: true,
          },
          ...fileCategories.flatMap((cat) =>
            cat.extensions.map((ext) => ({
              value: ext,
              label: ext.toUpperCase(),
              count: allFiles.filter((f) => f.extension === ext).length,
            })),
          ),
        ]
      : []),
  ];

  const peopleOptions = [
    { value: "all", label: "All People" },
    ...people.map((person) => ({
      value: person,
      label: person.split("@")[0],
      count: allFiles.filter((f) => f.createdBy?.email === person).length,
    })),
  ];

  const dateOptions = [
    { value: "all", label: "Any time" },
    { value: "today", label: "Today" },
    { value: "week", label: "This week" },
    { value: "month", label: "This month" },
    { value: "year", label: "This year" },
    { value: "before-year", label: "Before this year" },
  ];

  return (
    <div className="filter-bar">
      {/* Type Filter with Categories */}
      <CustomSelect
        value={filterType}
        onChange={setFilterType}
        options={typeOptions}
      />

      {/* People Filter */}
      <CustomSelect
        value={filterPeople}
        onChange={setFilterPeople}
        options={peopleOptions}
        disabled={people.length === 0}
      />

      {/* Date Filter */}
      <CustomSelect
        value={filterDate}
        onChange={setFilterDate}
        options={dateOptions}
      />
    </div>
  );
}

export default FilterBar;
