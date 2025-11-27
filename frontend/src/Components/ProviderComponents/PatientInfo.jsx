import React from 'react';
import { format } from 'date-fns';
import {
  Card,
  CardBody,
  Row,
  Col,
  Button,
  Label,
} from 'reactstrap';

const PatientInfo = ({ patientData, onEditClick }) => {
  return (
    <div className="patient-info">
      {/* Patient Comment */}
      <Card className="mb-4">
        <CardBody>
          <Label className="f-w-700">Client Comment:</Label>
          <p>{patientData?.patientComment || 'N/A'}</p>
        </CardBody>
      </Card>

      {/* Patient Information */}
      <Card>
        <CardBody>
          <Row className="mb-2">
            <Col>
              <Label className="f-w-700">Client Information:</Label>
            </Col>
            <Col className="text-end">
              <Button
                color="secondary"
                onClick={() => onEditClick(patientData)}
              >
                Edit
              </Button>
            </Col>
          </Row>

          <Row>
            <Col md="6" lg="3" className="mb-3">
              <p>
                <b>Legal Name:</b> {patientData?.firstName || ''}{' '}
                {patientData?.lastName || 'N/A'}
              </p>
              <p>
                <b>Date of Birth:</b>{' '}
                {patientData?.dateOfBirth
                  ? format(new Date(patientData?.dateOfBirth?.split('T')[0]), 'MM-dd-yyyy')
                  : 'N/A'}
              </p>
              <p>
                <b>Address:</b> {patientData?.address || 'N/A'}
              </p>
              <p>
                <b>Time Zone:</b> {patientData?.timeZone || 'N/A'}
              </p>
              <p>
                <b>Phone:</b> {patientData?.phoneNumber || 'N/A'}
              </p>
              <p>
                <b>Email:</b> {patientData?.email || 'N/A'}
              </p>
            </Col>

            <Col md="6" lg="3" className="mb-3">
              <p>
                <b>Administrative Sex:</b>{' '}
                {patientData?.administrativeSex || 'N/A'}
              </p>
              <p>
                <b>Gender Identity:</b>{' '}
                {patientData?.genderIdentity || 'N/A'}
              </p>
              <p>
                <b>Sexual Orientation:</b>{' '}
                {patientData?.sexualOrientation || 'N/A'}
              </p>
              <p>
                <b>Race:</b> {patientData?.race || 'N/A'}
              </p>
            </Col>

            <Col md="6" lg="3" className="mb-3">
              <p>
                <b>Ethnicity:</b> {patientData?.ethnicity || 'N/A'}
              </p>
              <p>
                <b>Languages:</b> {patientData?.languages || 'N/A'}
              </p>
              <p>
                <b>Marital Status:</b>{' '}
                {patientData?.maritalStatus || 'N/A'}
              </p>
              <p>
                <b>Employment:</b>{' '}
                {patientData?.employmentStatus || 'N/A'}
              </p>
            </Col>

            <Col md="6" lg="3" className="mb-3">
              <p>
                <b>Religious Affiliation:</b>{' '}
                {patientData?.religiousAffiliation || 'N/A'}
              </p>
              <p>
                <b>HIPPA:</b>{' '}
                {patientData?.signedHipaaNpp === 'ON' ? 'Enabled' : 'Disabled'}
              </p>
              <p>
                <b>PCP Release:</b> {patientData?.pcpRelease || 'N/A'}
              </p>
              <p>
                <b>Smoking Status:</b>{' '}
                {patientData?.smokingStatus || 'N/A'}
              </p>
            </Col>
          </Row>
        </CardBody>
      </Card>
    </div>
  );
};

export default PatientInfo;
