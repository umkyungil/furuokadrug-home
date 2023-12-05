/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { auth } from '../_actions/user_actions';
import { useSelector, useDispatch } from "react-redux";
import cookie from 'react-cookies';
import { USER_SERVER } from '../components/Config';
import moment from "moment";
import { getLocalTime, getServerDate, getLanguage, getMessage } from '../components/utils/CommonFunction';

// CORS 대책
import axios from 'axios';
axios.defaults.withCredentials = true;

export default function (SpecificComponent, option, adminRoute = null) {
    // 【option】
    // null 아무나 출입이 가능한 페이지
    // true 로그인 한 유저만 출입이 가능한 페이지
    // false 로그인한 유저는 출입이 불가능한 페이지

    // 【isTokenException】
    // true: 토큰 유효기간의 대상이 아님
    // undefined: 토큰 유효기간의 대상

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
                    // if (option) {
                    //     props.history.push('/login');
                    // }
                //로그인 한 상태 
                } else {
                    // 관리자가 아닌데 관리자만 들어갈수 있는 페이지에 들어가려 하면
                    // 랜딩 페이지로 보낸다 (adminRoute = true: 관리자만 들어갈수 있는 페이지)
                    if (adminRoute && !response.payload.isAdmin) {
                        props.history.push('/');
                    } else {
                        // 로그인 한 유저가(불특정 사용자가 아닌 경우) 로그인 하지 않은 유저가 들어갈수 있는 페이지에 들어가려 하면 랜딩페이지로 보낸다 
                        // 단 불특정 사용자인 경우 (사용자권한 3)는 페이지에 들어갈수 있게 한다
                        if (response.payload.role !== 3 && option === false) {
                            props.history.push('/');
                        }
                        // 불특정 사용자인 경우 토큰 체크를 하지 않는다
                        if (response.payload.role !== 3) {
                            // 관리자인 경우 제외를 한다
                            if (response.payload.role !== 2) {
                                // 토큰유효기간 체크(파라메터: 사용자 아이디, 사용자 토큰 유효시간)
                                handleChkTokenExp(response.payload._id);
                            }
                            
                        }
                    }
                }
            })
        }, [])

        // 페이지 이동시 토큰 유효기간 체크
        const handleChkTokenExp = async (userId) => {
            // 서버시간 가져오기(utc)
            // const serverDate = moment(getServerDate()).utc().format('YYYY-MM-DD HH:mm');
            // 서버시간을 로컬시간으로 변경
            const chgServerToLocalTime = moment(getServerDate()).local().format('YYYY-MM-DD HH:mm');
            // 토큰 유효시간을 로컬시간으로 변경
            const userTokenExp = parseInt(cookie.load('w_authExp'));
            const userTokenExpToLocal = getLocalTime(userTokenExp);
            
            try {
                // 현재시간이 토큰 유효시간보다 큰 경우
                if (moment(chgServerToLocalTime).isAfter(userTokenExpToLocal)) {
                    // 로그아웃 
                    await handleLogout();
                    props.history.push('/login');
                } else {
                    // 로그인 할때 저장한 세션스토리지에서 연장시간 가져오기
                    const sesTokenAddedTime  = sessionStorage.getItem("tokenAddedTime");
                    // 토큰 최대 연장시간을 구한다(서버 시간 + sesTokenAddedTime의 2배)
                    const numTokenAddedTime = parseInt(sesTokenAddedTime) * 2
                    const maxTokenExp = moment(chgServerToLocalTime).add(numTokenAddedTime, 'm').format('YYYY-MM-DD HH:mm');

                    // 토큰 최대 연장시간이 현재 토큰 유효시간보다 전 이나 같으면
                    if (moment(userTokenExpToLocal).isSameOrBefore(maxTokenExp)) {
                        // 토큰 유효시간 연장
                        await axios.post(`${USER_SERVER}/update/token`, { id: userId, tokenAddedTime:sesTokenAddedTime });
                    }
                }
            } catch (err) {
                console.log("auth handleChkTokenExp err: ", err);
                alert(getMessage(getLanguage(), 'key001'));
                props.history.push('/login')
            }
        }

        // Logout
        const handleLogout = async () => {
            try {
                const userId = localStorage.getItem("userId");
                await axios.get(`${USER_SERVER}/logout?id=${userId}`);

                localStorage.clear();
                sessionStorage.clear();

                // // 로컬스토리지 사용자 정보 삭제
                // localStorage.removeItem("userId");
                // localStorage.removeItem("userName");
                // localStorage.removeItem("userRole");
                // localStorage.removeItem("i18nextLng");
                // // 세션스토리지 사용자 정보 삭제
                // sessionStorage.removeItem("userId");
                // sessionStorage.removeItem("userName");
                // // 세션스토리지 랜딩페이지 비디오 정보 삭제
                // sessionStorage.removeItem("video_cn");
                // sessionStorage.removeItem("video_en");
                // sessionStorage.removeItem("video_jp");
                // //  토큰 연장시간 삭제
                // sessionStorage.removeItem("tokenAddedTime");
                // // 포인트 적용률 삭제
                // sessionStorage.removeItem("pointRate");
                
                // 쿠키 삭제
                cookie.remove('w_auth', { path: '/' });
                cookie.remove('w_authExp', { path: '/' });
            } catch (err) {
                console.log("auth handleLogout err: ", err);
            }
        };

        return (
            <SpecificComponent {...props} user={user} />
        )
    }

    return AuthenticationCheck;
}