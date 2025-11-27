import React, { useEffect, useState } from "react";
import {
  Form,
  FormGroup,
  Input,
  Label,
  Button,
  Col,
  Row,
  Card,
  CardBody,
} from "reactstrap";
import {
  addRecommendation,
  updateFrequency,
  toggleSigned,
} from "@/Redux/features/notes/notesSlice";
import { useDispatch, useSelector } from "react-redux";
import { useSession } from "next-auth/react";

const treatmentFrequency = [
  "As Needed",
  "Twice a Week",
  "Weekly",
  "Every 2 Weeks",
  "Every 4 Weeks",
  "Every Month",
  "Every 2 Months",
  "Every 3 Months",
];

const recommendationData = [
  "Continue Current therapeutic focus",
  "Change treatment goals or objectives",
  "Terminate treatment",
];

const Recommendation = ({ onClick }) => {
  const dispatch = useDispatch();
  const [showFrequency, setShowFrequency] = useState(false);

  const { frequency, isSigned, recommendation } = useSelector(
    (state) => state.notes
  );
  const { data: session } = useSession();
  const [selectedRadios, setSelectedRadios] = useState(
    recommendationData?.map((item) => recommendation?.includes(item))
  );

  useEffect(() => {
    setSelectedRadios(
      recommendationData?.map((item) => recommendation?.includes(item))
    );
  }, [recommendation]);

  const handleFrequency = (freq) => {
    dispatch(updateFrequency(freq));
    setShowFrequency(false);
  };

  const handleisSigned = () => {
    dispatch(toggleSigned());
  };

  const handleRadioClick = (index) => {
    const recommendationValue = recommendationData[index];
    dispatch(addRecommendation(recommendationValue)); // Toggle the presence of this recommendation
  };

  return (
    <Card className="mt-3">
      <CardBody>
        <Form>
          <Row>
            {/* Recommendations */}
            <Col md="6" className="mb-4">
              <FormGroup>
                <Label className="text-primary font-weight-bold">
                  Recommendation
                </Label>
                {recommendationData?.map((label, index) => (
                  <FormGroup
                    check
                    key={index}
                    className="d-flex align-items-center"
                  >
                    <Input
                      type="checkbox"
                      id={`radio${index}`}
                      checked={selectedRadios[index]}
                      onChange={() => handleRadioClick(index)}
                    />
                    <Label
                      for={`radio${index}`}
                      check
                      className="ms-2 mb-0 mt-1"
                    >
                      {label}
                    </Label>
                  </FormGroup>
                ))}
              </FormGroup>
            </Col>

            {/* Frequency Selector */}
            <Col md="6" className="mb-4">
              <FormGroup>
                <Label className="text-primary font-weight-bold">
                  Prescribed Frequency of Treatment
                </Label>
                <div className="position-relative">
                  <Input
                    type="text"
                    value={frequency}
                    onClick={() => setShowFrequency(!showFrequency)}
                    readOnly
                    className="cursor-pointer"
                  />
                  {showFrequency && (
                    <div className="position-absolute bg-white border rounded shadow-sm mt-1 w-100">
                      {treatmentFrequency?.map((freq, i) => (
                        <div
                          key={i}
                          className="px-2 py-1 cursor-pointer hover-bg-primary hover-text-white"
                          onClick={() => handleFrequency(freq)}
                        >
                          {freq}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </FormGroup>
            </Col>
          </Row>

          {/* Signature Section */}
          <Row className="bg-light p-3 mb-3">
            <Col>
              <FormGroup check className="d-flex align-items-center">
                <Input
                  type="checkbox"
                  id="checkbox2"
                  checked={isSigned}
                  onChange={handleisSigned}
                />
                <Label for="checkbox2" check className="ms-2 mb-0 mt-1">
                  Sign this form. I, {session?.user?.firstName}{" "}
                  {session?.user?.lastName}, Managing partner, declare this
                  information to be accurate and complete.
                </Label>
              </FormGroup>
            </Col>
          </Row>

          {/* Buttons */}
          <Row className="d-flex justify-content-between">
            <Col className="d-flex">
              <Button
                color={`${isSigned ? "primary" : "secondary"}`}
                onClick={onClick}
                disabled={!isSigned}
                className={`me-2 ${!isSigned ? "no-drop" : ""}`}
              >
                Save and Publish (Signed)
              </Button>
              <Button
                color={`${!isSigned ? "primary" : "secondary"}`}
                onClick={onClick}
                disabled={isSigned}
                className={`${isSigned ? "no-drop" : ""}`}
              >
                Save Unsigned
              </Button>
            </Col>
          </Row>
        </Form>
      </CardBody>
    </Card>
  );
};

export default Recommendation;
