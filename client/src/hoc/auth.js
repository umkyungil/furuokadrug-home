/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { auth } from '../_actions/user_actions';
import { useSelector, useDispatch } from "react-redux";
// import { useCookies } from "react-cookie";
// import { USER_SERVER } from '../components/Config';
// import moment from "moment";
// import axios from 'axios';
// CORS 대책
// axios.defaults.withCredentials = true;

export default function (SpecificComponent, option, adminRoute = null) {
    // const [Cookies, setCookie, removeCookie] = useCookies(["w_auth", "w_authExp"]);

    // 【option】
    // null 아무나 출입이 가능한 페이지
    // true 로그인 한 유저만 출입이 가능한 페이지
    // false 로그인한 유저는 출입이 불가능한 페이지
    function AuthenticationCheck(props) {
        let user = useSelector(state => state.user);
        const dispatch = useDispatch();

        useEffect(() => {
            // axios.get(`${USER_SERVER}/auth`)를 호출해서 토큰을 비교후 사용자 정보를 돌려 받는다
            dispatch(auth()).then(response => {
                //로그인 하지 앟은 상태
                if (!response.payload.isAuth) {
                    // 로그인 하지 않은 사람이 로그인 한 사람만 들어갈수 있는 
                    // 페이지에 들어가려 하면 로그인 페이지로 보낸다(option이 true인 경우는 로그인 한 사람만 들어갈수 있는 페이지)
                    if (option) {
                        props.history.push('/login')
                    }
                //로그인 한 상태 
                } else {
                    // 관리자가 아닌데 관리자만 들어갈수 있는 페이지에 들어가려 하면
                    // 랜딩 페이지로 보낸다(adminRoute === true: 관리자만 들어갈수 있는 페이지)
                    if (adminRoute && !response.payload.isAdmin) {
                        props.history.push('/')
                    } else {
                        // 로그인 한 유저가 로그인 하지 않은 유저가 들어가는 페이지에 들어가려 하면 랜딩페이지로 보낸다 
                        // 단 불특정 사용자인 경우 (사용자권한 3)는 페이지에 들어갈수 있게 한다
                        if (response.payload.role !== 3 && option === false) {
                            props.history.push('/')
                        }
                    }
                    
                    // 로그인 했는데 1시간이 지난경우 
                    // const _tokenExp = moment(response.payload.tokenExp).format('YYYY-MM-DD HH:mm');
                    // const _curDate = moment().format("YYYY-MM-DD HH:mm");
                    // const tokenExp = moment(response.payload.tokenExp).valueOf();
                    // const curDate = moment().valueOf();

                    // if (curDate > tokenExp) {
                    //     logoutHandler();
                    // };
                }
            })
        }, [])

        // Logout
        // const logoutHandler = () => {
        //     axios.get(`${USER_SERVER}/logout`).then(response => {
        //     if (response.status === 200) {
        //         // 로컬스토리지 사용자 정보 삭제
        //         localStorage.removeItem("userId");
        //         localStorage.removeItem("userName");
        //         localStorage.removeItem("userRole");
        //         localStorage.removeItem("i18nextLng");
        //         // 세션스토리지 사용자 정보 삭제
        //         sessionStorage.removeItem("userId");
        //         sessionStorage.removeItem("userName");
        //         // 세션스토리지 랜딩페이지 비디오 정보 삭제
        //         sessionStorage.removeItem("video_cn");
        //         sessionStorage.removeItem("video_en");
        //         sessionStorage.removeItem("video_jp");
        //         // 쿠키 삭제
        //         removeCookie("w_auth", { path: '/' });
        //         removeCookie("w_authExp", { path: '/' });

        //         props.history.push("/login");
        //     } else {
        //         console.log('Log Out Failed')
        //     }
        //     });
        // };

        return (
            <SpecificComponent {...props} user={user} />
        )
    }

    return AuthenticationCheck;
}