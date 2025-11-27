import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  title: "Treatment Plan",
  date: new Date().toLocaleDateString(),
  time: {
    selectedHour: new Date().getHours() % 12 || 12,
    selectedMinute: new Date().getMinutes(),
    selectedPeriod: new Date().getHours() >= 12 ? "PM" : "AM",
  },
  diagnosis: {
    code: "",
    description: "",
  },
  justification: "",
  problem: "",
  discharge: "",
  AdditionalInfo: "",
  goals: [
    {
      title: "Treatment Goal",
      objectives: [
        {
          id: 1,
          title: "Objective 1.1",
          objectiveValue: "",
          duration: "",
          strategy: [],
        },
      ],
    },
  ],
  frequency: "",
  isDeclared: false,
  isSigned: false,
  activePopup: null,
};

const documentSlice = createSlice({
  name: "document",
  initialState,
  reducers: {
    updateTitle: (state, action) => {
      state.title = action.payload;
    },
    updateJustification: (state, action) => {
      state.justification = action.payload;
    },
    updateDate: (state, action) => {
      state.date = action.payload.toLocaleDateString();
    },
    updateTime: (state, action) => {
      state.time = action.payload;
    },
    setActivePopup(state, action) {
      state.activePopup = action.payload;
    },
    updateProblem(state, action) {
      state.problem = action.payload;
    },
    updateDischarge(state, action) {
      state.discharge = action.payload;
    },
    updateAdditionalInfo(state, action) {
      state.AdditionalInfo = action.payload;
    },
    updateDiagnosis(state, action) {
      const { code, description } = action.payload;
      state.diagnosis.code = code;
      state.diagnosis.description = description;
    },
    updateGoalTitle(state, action) {
      const { goalIndex, html } = action.payload;
      state.goals[goalIndex].title = html;
    },
    setObjectives(state, action) {
      state.objectives = action.payload;
    },
    addGoal(state) {
      const newId = state.goals.length + 1;
      const currentObjectiveNumber = Math.floor(newId / 10) + 1;
      const currentSubObjectiveNumber = newId % 10 || 1;
      const newObjectiveTitle = `Treatment Goal ${currentSubObjectiveNumber}`;

      state.goals.push({
        id: newId,
        title: newObjectiveTitle,
        objectives: [],
      });
    },
    addObjective(state, action) {
      const goalIndex = action.payload;
      const newId = state.goals[goalIndex].objectives.length + 1;
      const currentObjectiveNumber = Math.floor(newId / 10) + 1;
      const currentSubObjectiveNumber = newId % 10 || 1;
      const newObjectiveTitle = `Objective ${currentObjectiveNumber}.${currentSubObjectiveNumber}`;

      state.goals[goalIndex].objectives.push({
        id: newId,
        title: newObjectiveTitle,
        strategy: [],
      });
    },
    handleObjectiveTitleChange(state, action) {
      const { goalIndex, index, html } = action.payload;
      state.goals[goalIndex].objectives[index].objectiveValue = html;
    },
    handleDurationChange(state, action) {
      const { goalIndex, index, item } = action.payload;
      state.goals[goalIndex].objectives[index].duration = item;
      state.activePopup = null; // Close popup after changing duration
    },
    handleAddField(state, action) {
      const { goalIndex, index, item } = action.payload;
      const newId =
        state.goals[goalIndex].objectives[index].strategy.length + 1;
      const newStrategyField = {
        intervention: item,
        modality: "",
        frequency: "",
        completion: "",
        status: "",
        id: newId,
      };
      if (!state.goals[goalIndex].objectives[index].strategy) {
        state.goals[goalIndex].objectives[index].strategy = [];
      }
      state.goals[goalIndex].objectives[index].strategy.push(newStrategyField);
      state.activePopup = null; // Close popup after adding field
    },
    handleRemoveField(state, action) {
      const { goalIndex, index, strategyIndex } = action.payload;
      state.goals[goalIndex].objectives[index].strategy.splice(
        strategyIndex,
        1
      );
    },
    handleStrategyFieldChange(state, action) {
      const { goalIndex, index, strategyIndex, item, fieldToUpdate } =
        action.payload;
      if (fieldToUpdate === "modality") {
        state.goals[goalIndex].objectives[index].strategy[
          strategyIndex
        ].modality = item;
      } else if (fieldToUpdate === "frequency") {
        state.goals[goalIndex].objectives[index].strategy[
          strategyIndex
        ].frequency = item;
      } else if (fieldToUpdate === "completion") {
        state.goals[goalIndex].objectives[index].strategy[
          strategyIndex
        ].completion = item;
      } else if (fieldToUpdate === "status") {
        state.goals[goalIndex].objectives[index].strategy[
          strategyIndex
        ].status = item;
      }
      state.activePopup = null; // Close popup after changing strategy field
    },
    updateFrequncy(state, action) {
      state.frequency = action.payload;
    },
    updateIsDeclared(state, action) {
      state.isDeclared = action.payload;
    },
    updateIsSigned(state, action) {
      state.isSigned = action.payload;
    },
    resetDocumentState(state) {
      Object.assign(state, initialState);
    },
    updateStateAndResetPopup(state, action) {
      const { payload, popupNull } = action.payload;
      Object.assign(state, payload);
      if (popupNull) {
        state.activePopup = null;
      }
    },
  },
});

export const {
  updateTitle,
  updateDate,
  updateTime,
  setActivePopup,
  updateDiagnosis,
  setGoal,
  updateProblem,
  updateDischarge,
  updateAdditionalInfo,
  // setObjectives,
  updateGoalTitle,
  addObjective,
  handleObjectiveTitleChange,
  handleDurationChange,
  handleAddField,
  handleRemoveField,
  handleStrategyFieldChange,
  updateFrequncy,
  updateIsDeclared,
  addGoal,
  updateIsSigned,
  resetDocumentState,
  updateStateAndResetPopup,
  updateJustification
} = documentSlice.actions;
export default documentSlice.reducer;
