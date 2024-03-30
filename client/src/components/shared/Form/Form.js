import React, { useState } from 'react'
import InputType from './InputType'
import { Link } from 'react-router-dom'
import { handleLogin, handleRegister } from '../../../services/authService'


const Form = ({ formType, formTitle, submitBtn }) => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [role, setRole] = useState('donor')
    const [name, setName] = useState('')
    const [organisationName, setorganisationName] = useState('')
    const [website, setWebsite] = useState('')
    const [address, setAddress] = useState('')
    const [phone, setPhone] = useState('')

    return (
        <div>
            <form onSubmit={(e) => {
                if (formType === "login") return handleLogin(e, email, password, role);
                else if (formType === "register") return handleRegister(e, name, role, email, password, organisationName, website, address, phone);
            }}>
                <h1 className='text-center'>{formTitle}</h1>
                <hr />
                <div className='d-flex mb-3'>
                    <div className='form-check'>
                        <input type='radio' className='form-check-input' name='role' id="donorRadio" value={"donor"} onChange={(e) => setRole(e.target.value)} defaultChecked></input>
                        <label htmlFor="donorRadio" className="form-check-label" >
                            Donor
                        </label>
                    </div>
                    <div className='form-check ms-2'>
                        <input type='radio' className='form-check-input' name='role' id="NGORadio" value={"NGO"} onChange={(e) => setRole(e.target.value)}></input>
                        <label htmlFor="NGORadio" className="form-check-label" >
                            NGO
                        </label>
                    </div>
                    <div className='form-check ms-3'>
                        <input type='radio' className='form-check-input' name='role' id="adminRadio" value={"admin"} onChange={(e) => setRole(e.target.value)} ></input>
                        <label htmlFor="adminRadio" className="form-check-label" >
                            Admin
                        </label>
                    </div>
                </div>
                {(() => {
                    switch (true) {
                        case formType === 'login': {
                            return (
                                <>
                                    <InputType labelText={'Email'} labelFor={'forEmail'} inputType={'Email'} name={'email'} value={email} onChange={(e) => setEmail(e.target.value)}></InputType>
                                    <InputType labelText={'Password'} labelFor={'forPassword'} inputType={'Password'} name={'password'} value={password} onChange={(e) => setPassword(e.target.value)}></InputType>
                                </>
                            );
                        }
                        case formType === 'register': {
                            return (
                                <>
                                    {(role === "admin" || role === "donor") && (
                                        <InputType labelText={'Name'} labelFor={'forName'} inputType={'name'} name={'name'} value={name} onChange={(e) => setName(e.target.value)}></InputType>
                                    )}
                                    {role === "NGO" && (
                                        <InputType labelText={'Organisation Name'} labelFor={'fororganisationName'} inputType={'organisationName'} name={'organisationName'} value={organisationName} onChange={(e) => setorganisationName(e.target.value)}></InputType>
                                    )}
                                    {role === "NGO" && (
                                        <InputType labelText={'Website'} labelFor={'forWebsite'} inputType={'website'} name={'website'} value={website} onChange={(e) => setWebsite(e.target.value)}></InputType>
                                    )}
                                    <InputType labelText={'Password'} labelFor={'forPassword'} inputType={'Password'} name={'password'} value={password} onChange={(e) => setPassword(e.target.value)}></InputType>
                                    <InputType labelText={'Email'} labelFor={'forEmail'} inputType={'Email'} name={'email'} value={email} onChange={(e) => setEmail(e.target.value)}></InputType >
                                    <InputType labelText={'Address'} labelFor={'forAddress'} inputType={'address'} name={'address'} value={address} onChange={(e) => setAddress(e.target.value)}></InputType>
                                    <InputType labelText={'Phone'} labelFor={'forPhone'} inputType={'phone'} name={'phone'} value={phone} onChange={(e) => setPhone(e.target.value)}></InputType>
                                </>
                            );
                        }

                    }
                })()}


                {/* <InputType labelText={'Email'} labelFor={'forEmail'} inputType={'Email'} name={'email'} value={email} onChange={(e) => setEmail(e.target.value)}></InputType>
                <InputType labelText={'Password'} labelFor={'forPassword'} inputType={'Password'} name={'password'} value={password} onChange={(e) => setPassword(e.target.value)}></InputType>
                <InputType labelText={'role'} labelFor={'forRole'} inputType={'role'} name={'role'} value={role} onChange={(e) => setRole(e.target.value)}></InputType>
                <InputType labelText={'name'} labelFor={'forName'} inputType={'name'} name={'name'} value={name} onChange={(e) => setName(e.target.value)}></InputType>
                <InputType labelText={'organisationName'} labelFor={'fororganisationName'} inputType={'organisationName'} name={'organisationName'} value={organisationName} onChange={(e) => setorganisationName(e.target.value)}></InputType>
                <InputType labelText={'website'} labelFor={'forWebsite'} inputType={'website'} name={'website'} value={website} onChange={(e) => setWebsite(e.target.value)}></InputType>
                <InputType labelText={'address'} labelFor={'forAddress'} inputType={'address'} name={'address'} value={address} onChange={(e) => setAddress(e.target.value)}></InputType>
                <InputType labelText={'phone'} labelFor={'forPhone'} inputType={'phone'} name={'phone'} value={phone} onChange={(e) => setPhone(e.target.value)}></InputType> */}


                <div className='d-felx justify-content-between'>
                    {formType === "login" ? (
                        <p>
                            Not registered yet ? Register
                            <Link to="/register"> Here!</Link>
                        </p>
                    ) : (
                        <p>
                            Already Registered. Please
                            <Link to="/login"> Login</Link>
                        </p>
                    )}
                    <button className='btn btn-primary' type="submit">
                        {submitBtn}
                    </button>
                </div>
            </form>
        </div >
    )
}

export default Form