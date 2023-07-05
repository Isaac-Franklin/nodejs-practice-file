import axios from 'axios';
const loginForm = document.querySelector('.form')

const Login = async (email, password) => {
    console.log(email, password)
    try{
        const res = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:3000/api/v1/user/login',
            data: {
                email,
                password
            }
        })
        console.log(res)
    }
    catch(err){
        console.log(err);
    }
}

loginForm.addEventListener('submit', (e) => {
    e.preventDefault()
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value
    console.log(email, password)
    Login(email, password)
})
