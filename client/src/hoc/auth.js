/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { auth } from '../_actions/user_actions';
import { useSelector, useDispatch } from "react-redux";

export default function (SpecificComponent, option, adminRoute = null) {
    // 【option】
    // null 아무나 출입이 가능한 페이지
    // true 로그인 한 유저만 출입이 가능한 페이지
    // false 로그인한 유저는 출입이 불가능한 페이지
    function AuthenticationCheck(props) {
        let user = useSelector(state => state.user);
        const dispatch = useDispatch();

        useEffect(() => {
            dispatch(auth()).then(response => {
                //로그인 하지 앟은 상태
                if (!response.payload.isAuth) {
                    // 로그인 하지 않은 사람이 로그인 한 사람만 들어갈수 있는 
                    // 페이지에 들어가려 하면 로그인 페이지로 보낸다(option === true: 로그인 한 사람만 들어갈수 있는 페이지)
                    if (option) {
                        props.history.push('/login')
                    }
                //로그인 한 상태 
                } else {
                    // 관리자가 아닌데 관리자만 들어갈수 있는 페이지에 들어가려 하면
                    // 랜딩페이지로 보낸다(adminRoute === true: 관리자만 들어갈수 있는 페이지)
                    if (adminRoute && !response.payload.isAdmin) {
                        props.history.push('/')
                    // 로그인 한 유저가 로그인 하지 않은 유저가 들어가는 페이지에 들어가려 하면
                    // 랜딩페이지로 보낸다
                    } else {
                        if (option === false) {
                            props.history.push('/')
                        }
                    }
                }
            })

        }, [])

        return (
            <SpecificComponent {...props} user={user} />
        )
    }

    return AuthenticationCheck
}