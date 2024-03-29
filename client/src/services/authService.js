import { userLogin, userRegister } from "../redux/features/auth/authActions";
import store from "../redux/store";

export const handleLogin = (e, email, password, role) => {
    e.preventDefault();
    try {
        if (!role || !email || !password) {
            return alert("Please Privde All Feilds");
        }
        // console.log('login', e, email, password, role);
        store.dispatch(userLogin({ email, password, role }));
    } catch (error) {
        console.log(error);
    }
};

export const handleRegister = (
    e, name, role, email, password, organisationName, website, address, phone
) => {
    e.preventDefault();
    try {
        store.dispatch(
            userRegister({
                e, name, role, email, password, organisationName, website, address, phone,
            })
        );
    } catch (error) {
        console.log(error);
    }
};