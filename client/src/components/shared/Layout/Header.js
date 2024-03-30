import React from 'react'
import { MdFastfood } from "react-icons/md";
import { CgProfile } from "react-icons/cg";
import { useSelector } from 'react-redux';

const Header = () => {
    const { user } = useSelector(state => state.auth)
    return (
        <div>
            <nav className='navbar'>
                <div className='container-fluid'>
                    <div className='navbar-brand h1 '>
                        <MdFastfood />   Rescued Bites
                    </div>
                    <ul className='navbar-nav flex-row'>
                        <li className='nav-item mx-3'>
                            <p className='nav-link'>
                                <CgProfile />    Welcome {" "}
                                {user?.name || user?.organisationName}{" "}
                                &nbsp;
                                <span className='badge bg-secondary'>{user?.role}</span>
                            </p>
                        </li>
                        <li className='nav-item mx-3'>
                            <button className='btn btn-danger'>Logout</button>
                        </li>
                    </ul>
                </div>
            </nav>
        </div>
    )
}

export default Header;