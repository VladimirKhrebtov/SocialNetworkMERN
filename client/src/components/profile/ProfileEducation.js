import React from "react";
import Moment from "react-moment";

const ProfileEducation = ({
  edu: { school, degree, fieldofstudy, to, from, description }
}) => {
  return (
    <div>
      <h3 className="text-dark">{school}</h3>
      <p>
        <Moment format="YYYY/MM/DD">{from}</Moment> -{" "}
        {!to ? "Now" : <Moment format="YYYY/MM/DD">{to}</Moment>}
      </p>
      <p>
        <strong>Position: </strong> {degree}
      </p>
        <p>
            <strong>Field of study: </strong> {fieldofstudy}
        </p>
      <p>
        <strong>Description: </strong> {description}
      </p>
    </div>
  );
};

export default ProfileEducation;
