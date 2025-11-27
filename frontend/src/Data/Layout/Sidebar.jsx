export const MenuList = [
  {
    Items: [
      {
        title: "Home",
        id: 1,
        icon: "Home",
        type: "link",
        path: `/user/home`,
      },
      {
        title: "Dashboard",
        id: 2,
        icon: "Category",
        type: "link",
        path: `/user/dashboard`,
        active: false,
      },
      {
        title: "AI Generated Summaries",
        id: 3,
        icon: "Chat",
        type: "link",
        path: `/user/ai-generated-summary`,
        active: false,
      },
      {
        title: "Report",
        id: 4,
        icon: "Document",
        type: "link",
        path: `/user/report`,
        active: false,
      },
      {
        title: "Goals & Exercises",
        id: 5,
        icon: "Tick-square",
        type: "link",
        path: `/user/support-guidance`,
        active: false,
      },
    ],
  },
];

export const ProviderMenuList = [
  {
    Items: [
      {
        title: "Home",
        id: 1,
        icon: "Home",
        type: "link",
        path: `/provider/home`,
      },
      {
        title: "Dashboard",
        id: 2,
        icon: "Category",
        type: "link",
        path: `/provider/dashboard`,
        active: false,
      },
      {
        title: "Client Listing",
        id: 3,
        icon: "Document",
        type: "link",
        path: `/provider/patient-listing`,
        active: false,
      },
      {
        title: "Open Notes",
        id: 4,
        icon: "Document",
        type: "link",
        path: `/provider/notes-listing`,
        active: false,
      },
    ],
  },
];
