import { catchAsyncError } from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "../utils/ErrorHandler.js";
// import PatientMedicalInfo from "../model/patientMedicalInfo.model.js";
import userInfo from "../model/user.model.js";

export const editPatientMedicalInfo = catchAsyncError(
  async (req, res, next) => {
    try {
      const patientId = req.params.patientId;
      const PatientMedicalInfoData = await userInfo.findOne({
        _id: patientId,
      });

      if (!PatientMedicalInfoData) {
        return next(new ErrorHandler("Patient not found", 404));
      }

      const {
        patientComment,
        preferredName,
        pronouns,
        dateOfBirth,
        address1,
        address2,
        cityState,
        mobilePhone,
        homePhone,
        workPhone,
        otherPhone,
        administrativeSex,
        genderIdentity,
        sexualOrientation,
        race,
        ethnicity,
        languages,
        maritalStatus,
        employmentStatus,
        religiousAffiliation,
        signedHipaaNpp,
        pcpRelease,
        smokingStatus,
      } = req.body;

      let formattedDate = ""; // Initialize to an empty string

      if (dateOfBirth) {
        // Check if dateOfBirth is provided
        try {
          const parsedDate = new Date(dateOfBirth); // Attempt to parse date
          formattedDate = parsedDate.toISOString().slice(0, 10); // Format if parsed successfully
        } catch (error) {
          formattedDate = "0000-00-00T00:00:00.000+00:00";
          // Handle parsing errors (e.g., invalid date format)
          console.error("Invalid date format:", dateOfBirth);
          // Consider displaying a user-friendly message or providing a validation hint
        }
      }

      const patientToUpdate = await userInfo.findByIdAndUpdate(
        patientId,
        {
          $set: {
            patientComment,
            preferredName,
            pronouns,
            dateOfBirth: formattedDate,
            address1,
            address2,
            cityState,
            mobilePhone,
            homePhone,
            workPhone,
            otherPhone,
            administrativeSex,
            genderIdentity,
            sexualOrientation,
            race,
            ethnicity,
            languages,
            maritalStatus,
            employmentStatus,
            religiousAffiliation,
            signedHipaaNpp,
            pcpRelease,
            smokingStatus,
          },
        },
        { new: true } // Return the updated document
      );

      if (!patientToUpdate) {
        return next(new ErrorHandler("Patient Info not found", 404));
      }

      res.status(200).json({
        success: true,
        PatientData: patientToUpdate,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
