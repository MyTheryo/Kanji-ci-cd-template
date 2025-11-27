import React, { useEffect, useState } from "react";
// import TimezoneSelect from "@/app/components/CommonComponents/TimezoneSelect";
// import LanguageDropdown from "@/app/components/CommonComponents/LanguageDropdown";
// import RaceDropdown from "@/app/components/CommonComponents/RaceDropdown";
// import EthnicityDropdown from "@/app/components/CommonComponents/EthnicityDropdown";
// import { useEditPatientMedicalInfoMutation } from "@/redux/features/patientMedicalInfo/patientMedicalInfoApi";
// import toast from "react-hot-toast";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import TimezoneSelect from "@/CommonComponent/TimezoneSelect";
import RaceDropdown from "@/CommonComponent/RaceDropdown";
import EthnicityDropdown from "@/CommonComponent/EthnicityDropdown";
import LanguageDropdown from "@/CommonComponent/LanguageDropdown";
// import { updateUserInfo } from "../../../redux/features/auth/authSlice";
import {
  Button,
  Container,
  Row,
  Col,
  Form,
  FormGroup,
  Label,
  Input,
  Card,
  CardBody,
} from "reactstrap";
import { useEditPatientMedicalInfoMutation } from "@/Redux/features/patientMedicalInfo/patientMedicalInfoApi";

const EditPatientInfo = ({
  patientData,
  setIsEditing,
  onUpdate,
  onCancel,
  onSave,
}) => {
  // Form state variables to hold edited values
  const [formData, setFormData] = useState({
    ...patientData,
    dateOfBirth: patientData.dateOfBirth
      ? new Date(patientData.dateOfBirth).toISOString().split("T")[0]
      : "", // Format dateOfBirth to YYYY-MM-DD
  });
  const dispatch = useDispatch();

  const [EditPatientInfo, { data, isSuccess }] =
    useEditPatientMedicalInfoMutation();
  const [patientComment, setPatientComment] = useState("");
  const [preferredName, setPreferredName] = useState("");
  const [pronouns, setPronouns] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");

  const [cityState, setCityState] = useState("");
  const [mobilePhone, setMobilePhone] = useState("");
  const [homePhone, setHomePhone] = useState("");
  const [workPhone, setWorkPhone] = useState("");
  const [otherPhone, setOtherPhone] = useState("");
  const [administrativeSex, setAdministrativeSex] = useState("");
  const [genderIdentity, setGenderIdentity] = useState("");
  const [sexualOrientation, setSexualOrientation] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [employmentStatus, setEmploymentStatus] = useState("");
  const [religiousAffiliation, setReligiousAffiliation] = useState("");
  const [signedHipaaNpp, setSignedHipaaNpp] = useState(false); // Boolean value for signed HIPAA/NPP
  const [pcpRelease, setPcpRelease] = useState("");
  const [smokingStatus, setSmokingStatus] = useState("");
  const [isTimezoneSelectEnabled, setIsTimezoneSelectEnabled] = useState(true);
  const [selectedSex, setSelectedSex] = useState(
    formData.administrativeSex || ""
  );

  // Handle timezone selection
  const handleTimezoneSelect = (selectedZone) => {
    setFormData((prevData) => ({
      ...prevData,
      timeZone: selectedZone, // Update the timezone in formData
    }));
  };

  const handleRaceSelect = (selectedRace) => {
    setFormData((prevData) => ({
      ...prevData,
      race: selectedRace,
    }));
  };
  const handleEthnicitySelect = (selectedEthnicity) => {
    setFormData((prevData) => ({
      ...prevData,
      ethnicity: selectedEthnicity,
    }));
  };
  const handleLanguageSelect = (selectedLanguage) => {
    setFormData((prevData) => ({
      ...prevData,
      languages: selectedLanguage,
    }));
  };

  const handleChange = (event) => {
    setSelectedSex(event.target.value);
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSave = () => {
    const data = {
      patientId: formData._id,
      patientComment: formData.patientComment,
      preferredName: formData.preferredName,
      pronouns: formData.pronouns,
      dateOfBirth: formData.dateOfBirth,
      address1: formData.address1,
      address2: formData.address2,
      cityState: formData.cityState,
      mobilePhone: formData.mobilePhone,
      homePhone: formData.homePhone,
      workPhone: formData.workPhone,
      otherPhone: formData.otherPhone,
      administrativeSex: formData.administrativeSex,
      genderIdentity: formData.genderIdentity,
      sexualOrientation: formData.sexualOrientation,
      race: formData.race,
      ethnicity: formData.ethnicity,
      languages: formData.languages,
      maritalStatus: formData.maritalStatus,
      employmentStatus: formData.employmentStatus,
      religiousAffiliation: formData.religiousAffiliation,
      signedHipaaNpp: formData.signedHipaaNpp,
      pcpRelease: formData.pcpRelease,
      smokingStatus: formData.smokingStatus,
    };

    EditPatientInfo({ patientId: formData._id, data: data });
    toast.success("Client data updated successfully!");
    onUpdate(formData);
    setIsEditing(false); // Assuming this sets editing mode to false
  };
  useEffect(() => {
    if (isSuccess) {
      toast.success("Client data updated successfully!");
    }
  }, [isSuccess]);

  const handleDelete = () => {
    onDelete();
    setIsEditing(false);
  };
  const handleCancel = () => {
    onCancel();
    setIsEditing(false);
  };
  return (
    <Container fluid className="py-4">
      <Card>
        <CardBody>
          <h2 className="mb-4">Edit Client Information</h2>
          <Form onSubmit={(e) => e.preventDefault()}>
            <Row>
              <Col md="12">
                <FormGroup>
                  <Label for="patientComment">Client Comment</Label>
                  <Input
                    type="textarea"
                    name="patientComment"
                    id="patientComment"
                    placeholder="Enter client comment"
                    value={formData.patientComment || ""}
                    onChange={handleChange}
                    rows="4"
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label for="firstName">Legal Name</Label>
                  <Input
                    type="text"
                    name="firstName"
                    id="firstName"
                    value={formData.firstName || ""}
                    disabled
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="lastName">Middle Name</Label>
                  <Input
                    type="text"
                    name="lastName"
                    id="lastName"
                    value={formData.lastName || ""}
                    disabled
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="preferredName">Preferred Name</Label>
                  <Input
                    type="text"
                    name="preferredName"
                    id="preferredName"
                    placeholder="Optional"
                    value={formData.preferredName || ""}
                    onChange={handleChange}
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="pronouns">Pronouns</Label>
                  <Input
                    type="select"
                    name="pronouns"
                    id="pronouns"
                    value={formData.pronouns || ""}
                    onChange={handleChange}
                  >
                    <option value="">Please Select</option>
                    <option value="he/him">He/Him</option>
                    <option value="she/her">She/Her</option>
                    <option value="they/them">They/Them</option>
                  </Input>
                </FormGroup>
                <FormGroup>
                  <Label for="dateOfBirth">Date of Birth</Label>
                  <Input
                    type="date"
                    name="dateOfBirth"
                    id="dateOfBirth"
                    value={formData.dateOfBirth || ""}
                    onChange={handleChange}
                    max={new Date().toISOString().split("T")[0]} // Max date set to today
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="address1">Address 1</Label>
                  <Input
                    type="text"
                    name="address1"
                    id="address1"
                    value={formData.address1 || ""}
                    onChange={handleChange}
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="address2">Address 2</Label>
                  <Input
                    type="text"
                    name="address2"
                    id="address2"
                    value={formData.address2 || ""}
                    onChange={handleChange}
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="cityState">City/State</Label>
                  <Input
                    type="text"
                    name="cityState"
                    id="cityState"
                    value={formData.cityState || ""}
                    onChange={handleChange}
                  />
                </FormGroup>
              </Col>

              <Col md="6">
                <FormGroup>
                  <Label for="timeZone">TimeZone</Label>
                  <TimezoneSelect
                    timeZone={formData.timeZone}
                    onTimeZoneSelect={handleTimezoneSelect}
                  />
                </FormGroup>

                <FormGroup>
                  <Label for="administrativeSex">Administrative Sex</Label>
                  <div style={{ marginBottom: "30px" }}>
                    <FormGroup check inline>
                      <Input
                        type="radio"
                        name="administrativeSex"
                        value="Male"
                        checked={formData.administrativeSex === "Male"}
                        onChange={handleChange}
                      />
                      <Label check>Male</Label>
                    </FormGroup>
                    <FormGroup check inline>
                      <Input
                        type="radio"
                        name="administrativeSex"
                        value="Female"
                        checked={formData.administrativeSex === "Female"}
                        onChange={handleChange}
                      />
                      <Label check>Female</Label>
                    </FormGroup>
                    <FormGroup check inline>
                      <Input
                        type="radio"
                        name="administrativeSex"
                        value="Other"
                        checked={formData.administrativeSex === "Other"}
                        onChange={handleChange}
                      />
                      <Label check>Other</Label>
                    </FormGroup>
                  </div>
                </FormGroup>

                <FormGroup>
                  <Label for="genderIdentity">Gender Identity</Label>
                  <Input
                    type="select"
                    name="genderIdentity"
                    value={formData.genderIdentity || ""}
                    onChange={handleChange}
                  >
                    <option value="">Select Gender Identity</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Transgender-Man">Transgender Man</option>
                    <option value="Transgender-Woman">Transgender Woman</option>
                    <option value="Non-binary">Non-binary</option>
                  </Input>
                </FormGroup>

                <FormGroup>
                  <Label for="sexualOrientation">Sexual Orientation</Label>
                  <Input
                    type="select"
                    name="sexualOrientation"
                    value={formData.sexualOrientation || ""}
                    onChange={handleChange}
                  >
                    <option value="">Select Sexual Orientation</option>
                    <option value="Asexual">Asexual</option>
                    <option value="Bisexual">Bisexual</option>
                    <option value="LesbianGay">Lesbian or Gay</option>
                    <option value="Straight">Straight</option>
                  </Input>
                </FormGroup>

                <FormGroup>
                  <Label for="race">Race</Label>
                  <RaceDropdown
                    onSelect={handleRaceSelect}
                    selectedRace={formData.race}
                  />
                </FormGroup>

                <FormGroup>
                  <Label for="ethnicity">Ethnicity</Label>
                  <EthnicityDropdown
                    onSelect={handleEthnicitySelect}
                    selectedEthnicity={formData.ethnicity}
                  />
                </FormGroup>

                <FormGroup>
                  <Label for="languages">Languages</Label>
                  <LanguageDropdown
                    onSelect={handleLanguageSelect}
                    selectedLanguage={formData.languages}
                  />
                </FormGroup>

                <FormGroup>
                  <Label for="maritalStatus">Marital Status</Label>
                  <Input
                    type="select"
                    name="maritalStatus"
                    value={formData.maritalStatus || ""}
                    onChange={handleChange}
                  >
                    <option value="">Select Marital Status</option>
                    <option value="UnMarried">UnMarried</option>
                    <option value="Married">Married</option>
                  </Input>
                </FormGroup>
              </Col>
            </Row>

            <div className="d-flex justify-content-center">
              <Button color="success" onClick={handleSave}>
                Save Changes
              </Button>
              <Button color="danger" onClick={handleCancel} className="ms-3">
                Cancel
              </Button>
            </div>
          </Form>
        </CardBody>
      </Card>
    </Container>
  );
};

export default EditPatientInfo;
