import React, { useEffect } from "react";
import Form from "../../components/shared/Form/Form";
import Spinner from "../../components/shared/Spinner";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";


const Register = () => {
    const { loading, error } = useSelector((state) => state.auth);
    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);
    return (
        <>
            {error && <span>{toast.error(error)}</span>}
            {loading ? (
                <Spinner />
            ) : (
                <div className="row">
                    <div className="col-md-8 form-banner">
                        <img src="./assets/images/register_image.jpg" alt="registerpage" />
                    </div>
                    <div className="col-md-4 form-container">
                        <Form formTitle={'Register'} submitBtn={'Register'} formType={'register'} />
                    </div>
                </div>
            )}
        </>
    );
};

export default Register;