import React from "react";
import Form from "../../components/shared/Form/Form";

const Register = () => {
    return (
        <>
            <div className="row">
                <div className="col-md-8 form-banner">
                    <img src="./assets/images/register_image.jpg" alt="registerpage" />
                </div>
                <div className="col-md-4 form-container">
                    <Form formTitle={'Register'} submitBtn={'Register'} formType={'register'} />
                </div>
            </div>
        </>
    );
};

export default Register;