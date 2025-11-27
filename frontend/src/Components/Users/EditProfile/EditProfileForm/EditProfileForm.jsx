import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Col,
  FormGroup,
  Input,
  Label,
  Row,
  Form,
} from "reactstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import CommonCardHeader from "../../../../CommonComponent/CommonCardHeader/CommonCardHeader";
import { useEditProfileMutation } from "@/Redux/features/user/userApi";
import { updateUserInfo } from "@/Redux/features/auth/authSlice";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import TimezoneSelect from "@/CommonComponent/TimezoneSelect";
import Loader from "@/Components/Loader";
import Image from "next/image";
import { Address, City, LastName } from "../../../../Constant";
import { ImagePath } from "../../../../Constant";
import { stateData } from "@/data";
import { decodeBase64 } from "@/utils/helpers";

const zipCodeRegex = /^\d{5}(?:[-\s]?\d{4})?$/;
// const phoneRegex = /^\+1[\s-]?\d{3}[\s-]?\d{3}[\s-]?\d{4}$/;
const lastNameRegex = /^[A-Za-z\s]+$/;
const cityRegex = /^[A-Za-z\s]+$/;

// Yup schema for form validation
const validationSchema = Yup.object({
  firstName: Yup.string()
    .min(1, "First name is required")
    .matches(
      /^[A-Za-z\s]+$/,
      "First name should only contain letters and spaces."
    ),
  lastName: Yup.string()
    .optional()
    .matches(
      lastNameRegex,
      "Last name should only contain letters and spaces."
    ),
  // phoneNumber: Yup.string()
  //   .matches(phoneRegex, "Phone number must be a US format \n (+1 XXXXXXXXXX).")
  //   .optional(),
  // address: Yup.string().optional(),
  city: Yup.string()
    .matches(cityRegex, "City should only contain letters and spaces.")
    .optional(),
  state: Yup.string().optional(),
  timeZone: Yup.string().required("Time Zone is required"),
  zipCode: Yup.string()
    .matches(zipCodeRegex, "Please enter a valid Zip code. XXXXX-XXXX OR XXXXX")
    .optional(),
});

const EditProfileForm = () => {
  const { data: session, status, update } = useSession();
  const dispatch = useDispatch();
  const [profilePicture, setProfilePicture] = useState(
    `${ImagePath}/profile.jpg`
  );
  const [avatar, setAvatar] = useState(profilePicture);
  const [initialFormData, setInitialFormData] = useState(null);
  const fileInputRef = useRef(null);
  const stateNames = stateData.map((state) => state.name);
  const [editProfile, { isLoading, isSuccess, isError, error, data }] =
    useEditProfileMutation();

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      // Populate form with initial user data
      const initialData = {
        firstName: session.user.firstName || "",
        lastName: session.user.lastName || "",
        phoneNumber: session.user.phoneNumber || "",
        address: session.user.address || "",
        city: session.user.city || "",
        state: session.user.state || "",
        timeZone:
          session.user.timeZone || process.env.NEXT_PUBLIC_DEFAULT_TIMEZONE,
        zipCode: session.user.zipCode || "",
        npiNumber:
          session.user.userRole === "Provider"
            ? session.user.npiNumber || ""
            : "", // npiNumber is now using as License Number for Provider Only
      };
      setAvatar(session?.user?.avatar?.url || profilePicture);
      setInitialFormData(initialData);
      formik.setValues(initialData);
    }
  }, [session, status]);

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      phoneNumber: "",
      address: "",
      city: "",
      state: "",
      timeZone: process.env.NEXT_PUBLIC_DEFAULT_TIMEZONE || "",
      zipCode: "",
      npiNumber: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      // Prepare the data to be submitted
      const dataToSubmit = {
        ...values,
        avatar, // Include the avatar in the form submission
      };

      // Check for changes
      if (
        JSON.stringify(values) === JSON.stringify(initialFormData) &&
        avatar === session?.user?.avatar?.url
      ) {
        toast.error("No changes yet");
        return;
      }

      try {
        await editProfile(dataToSubmit);
      } catch (err) {
        toast.error("Failed to update profile");
      }
    },
  });

  useEffect(() => {
    if (isSuccess) {
      dispatch(updateUserInfo(data?.user));
      update({ user: data?.user });
      toast.success("Profile updated successfully");
    }
    if (isError) {
      toast.error(error.data.message);
    }
  }, [isSuccess, isError]);

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (status === "loading" || isLoading) {
    return <Loader />;
  }
  return (
    <Col xl="8">
      <Form onSubmit={formik.handleSubmit}>
        <Card>
          <CommonCardHeader title="Edit Profile" tagClass={"card-title mb-0"} />
          <CardBody>
            <Row className="mb-2">
              <div className="profile-title">
                <div className="d-flex">
                  <div className="position-relative profileimg">
                    <input
                      type="file"
                      ref={fileInputRef}
                      style={{ display: "none" }}
                      onChange={handleImageChange}
                    />
                    <Image
                      width={70}
                      height={70}
                      className="img-70 rounded-circle clickable-image"
                      alt="edit-user"
                      src={avatar}
                      onClick={handleImageClick}
                    />
                    <i
                      type="button"
                      onClick={handleImageClick}
                      className="icon-camera"
                    />
                  </div>
                  <div className="flex-grow-1">
                    <h4 className="mb-1">
                      {session?.user?.firstName} {session?.user?.lastName}
                    </h4>
                    <h6 className="mb-1">{session?.user?.email}</h6>
                    <h6 className="mb-1">
                      ID: {decodeBase64(session?.user?.customerId)}
                    </h6>
                  </div>
                </div>
              </div>
            </Row>
            <Row>
              {/* Form fields */}
              <Col sm="6" md="6">
                <FormGroup>
                  <Label>
                    First Name <span className="text-danger">*</span>
                  </Label>
                  <Input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={formik.values.firstName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    invalid={
                      formik.touched.firstName && !!formik.errors.firstName
                    }
                    required
                  />
                  {formik.touched.firstName && formik.errors.firstName && (
                    <div className="text-danger">{formik.errors.firstName}</div>
                  )}
                </FormGroup>
              </Col>
              <Col sm="6" md="6">
                <FormGroup>
                  <Label>{LastName}</Label>
                  <Input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={formik.values.lastName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    invalid={
                      formik.touched.lastName && !!formik.errors.lastName
                    }
                  />
                  {formik.touched.lastName && formik.errors.lastName ? (
                    <div className="text-danger">{formik.errors.lastName}</div>
                  ) : null}
                </FormGroup>
              </Col>
              {/* <Col sm="6" md="6">
                <FormGroup>
                  <Label>Phone Number</Label>
                  <Input
                    type="string"
                    name="phoneNumber"
                    placeholder="+1 2345678909"
                    value={formik.values.phoneNumber}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    invalid={
                      formik.touched.phoneNumber && !!formik.errors.phoneNumber
                    }
                  />
                  {formik.touched.phoneNumber && formik.errors.phoneNumber ? (
                    <div className="text-danger">
                      {formik.errors.phoneNumber}
                    </div>
                  ) : null}
                </FormGroup>
              </Col> */}
              {/* <Col md="6">
                <FormGroup>
                  <Label>{Address}</Label>
                  <Input
                    type="text"
                    name="address"
                    placeholder="Home Address"
                    value={formik.values.address}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    invalid={formik.touched.address && !!formik.errors.address}
                  />
                  {formik.touched.address && formik.errors.address ? (
                    <div className="text-danger">{formik.errors.address}</div>
                  ) : null}
                </FormGroup>
              </Col> */}
              <Col sm="6" md="6">
                <FormGroup>
                  <Label>{City}</Label>
                  <Input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={formik.values.city}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    invalid={formik.touched.city && !!formik.errors.city}
                  />
                  {formik.touched.city && formik.errors.city ? (
                    <div className="text-danger">{formik.errors.city}</div>
                  ) : null}
                </FormGroup>
              </Col>
              <Col sm="6" md="6">
                <FormGroup>
                  <Label>
                    Time Zone <span className="text-danger">*</span>
                  </Label>
                  <TimezoneSelect
                    timeZone={formik.values.timeZone}
                    onTimeZoneSelect={(zone) =>
                      formik.setFieldValue("timeZone", zone)
                    }
                  />
                  {formik.touched.timeZone && formik.errors.timeZone && (
                    <div className="text-danger">{formik.errors.timeZone}</div>
                  )}
                </FormGroup>
              </Col>
              <Col sm="6" md="6">
                <FormGroup>
                  <Label>State</Label>
                  <select
                    name="state"
                    id="state"
                    value={formik.values.state}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="form-select px-4 py-2 rounded-lg border"
                  >
                    <option value="">Select State</option>
                    {stateNames.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                  {formik.touched.state && formik.errors.state && (
                    <div className="text-danger">{formik.errors.state}</div>
                  )}
                </FormGroup>
              </Col>
              <Col sm="6" md="6">
                <FormGroup>
                  <Label>Zip Code</Label>
                  <Input
                    type="string"
                    name="zipCode"
                    placeholder="ZIP Code"
                    value={formik.values.zipCode}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    invalid={formik.touched.zipCode && !!formik.errors.zipCode}
                  />
                  {formik.touched.zipCode && formik.errors.zipCode ? (
                    <div className="text-danger">{formik.errors.zipCode}</div>
                  ) : null}
                </FormGroup>
              </Col>
              {session?.user?.userRole === "Provider" && (
                <Col sm="6" md="6">
                  <FormGroup>
                    <Label>License Number</Label>
                    <Input
                      type="text"
                      name="npiNumber"
                      placeholder="License Number"
                      value={formik.values.npiNumber}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      min={0}
                      invalid={
                        formik.touched.npiNumber && !!formik.errors.npiNumber
                      }
                    />
                    {formik.touched.npiNumber && formik.errors.npiNumber ? (
                      <div className="text-danger">
                        {formik.errors.npiNumber}
                      </div>
                    ) : null}
                  </FormGroup>
                </Col>
              )}
            </Row>
          </CardBody>
          <CardFooter className="text-end">
            <Button color="primary" type="submit">
              Update Profile
            </Button>
          </CardFooter>
        </Card>
      </Form>
    </Col>
  );
};

export default EditProfileForm;
