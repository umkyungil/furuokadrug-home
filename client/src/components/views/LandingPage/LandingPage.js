import React, { useState, useEffect, useContext, useRef } from "react";
import styles from './LandingPage.module.css';
import Slider from "react-slick";
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { PRODUCT_SERVER, IMAGES_SERVER } from '../../Config.js';
import { MAIN_CATEGORY, PRODUCT_VISIBLE_TYPE, IMAGES_TYPE, I18N_ENGLISH, I18N_JAPANESE, I18N_CHINESE, IMAGES_VISIBLE_ITEM, 
        SALE_TAG, NOTICE_TAG, VIDEO_JP, VIDEO_CN, VIDEO_EN } from '../../utils/Const';
import { Button, Tag } from 'antd';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageContext } from '../../context/LanguageContext';
import axios from 'axios';
import moment from 'moment';

import ReactPlayer from 'react-player'
// CORS 대책
axios.defaults.withCredentials = true;


function LandingPage() {
  const [videoSrc, setVideoSrc] = useState("");
  const [nowOnAirAndRec, setNowOnAir] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [sale, setSale] = useState([]);
  const [Banner, setBanner] = useState({});
  const [Pharmaceutical, setPharmaceutical] = useState({});
  const [Cosmetics, setCosmetics] = useState({});
  const [DailyNecessaries, setDailyNecessaries] = useState({});
  const [Food, setFood] = useState({});
  const [url, setUrl] = useState("");

  const _history = useHistory();
  const {t, i18n} = useTranslation();
  const {setIsLanguage, isLanguage} = useContext(LanguageContext);
    
  useEffect(() => {
    if (isLanguage === "") {
      setIsLanguage(localStorage.getItem("i18nextLng"))
    }
    i18n.changeLanguage(isLanguage);

    // 화면구성하기
    process();
  },[url]);

  const process = async () => {
    // 노출상풍을 가져오기
    await getProducts(); // type 1:now on air, type 2:recording, type 3: recommended, type 4: sale
    // 이미지 가져오기
    await getImages(); // visible 0:private, visible:public
  }

  // 노출상풍을 가져오기
  const getProducts = async () => {
    try {
      const body = { 
        skip: 0, 
        limit: 20, 
        type: [ PRODUCT_VISIBLE_TYPE[1].key, 
                PRODUCT_VISIBLE_TYPE[2].key, 
                PRODUCT_VISIBLE_TYPE[3].key, 
                PRODUCT_VISIBLE_TYPE[4].key 
              ]
      }
      const products =  await axios.post(`${PRODUCT_SERVER}/products_by_type`, body);
      
      if (products.data.productInfos.length > 0) {
        let arrNowOnAir = [], realNowOnAir = [], arrRecommended = [], arrSale = [];
  
        products.data.productInfos.map((product) => {
          for (let i = 0; i < product.exposureType.length; i++) {
            // 일반상품: 0, 방송상품: 1, 동영상 존재 상품: 2, 추천상품: 3, 세일상품: 4
            // 1: 방송상품(now on sale)과 2: recording가 같이 등록된 상품은 없기에 같은 배열에 넣어도 상품이 중복안된다
            if (product.exposureType[i] === PRODUCT_VISIBLE_TYPE[1].key) {
              arrNowOnAir.push(product);
              realNowOnAir.push(product);
            } else if (product.exposureType[i] === PRODUCT_VISIBLE_TYPE[2].key) {
              arrNowOnAir.push(product);
            } else if (product.exposureType[i] === PRODUCT_VISIBLE_TYPE[3].key) {
              arrRecommended.push(product);
            } else if (product.exposureType[i] === PRODUCT_VISIBLE_TYPE[4].key) {
              arrSale.push(product);
            }
          }
        });
        
        // 초기화면 또는 비디오 정보가 없는 상품인 경우는 now on air 원래 상품의 비디오를 설정
        if (!sessionStorage.getItem(VIDEO_JP) || !sessionStorage.getItem(VIDEO_CN) || !sessionStorage.getItem(VIDEO_EN)) {
          if (isLanguage === I18N_JAPANESE) {
            setVideoSrc(realNowOnAir[0].japaneseUrl);
          } else if (isLanguage === I18N_CHINESE) {
            setVideoSrc(realNowOnAir[0].chineseUrl);
          } else {
            setVideoSrc(realNowOnAir[0].englishUrl);
          }
        } else {
          // 세션에 비디오 값이 있으면 (이미지를 클릭했을 경우) 언어에 따라 세션에서 이미지를 가져와서 설정
          if (isLanguage === I18N_JAPANESE) {
            setVideoSrc(sessionStorage.getItem(VIDEO_JP));
          } else if (isLanguage === I18N_CHINESE) {
            setVideoSrc(sessionStorage.getItem(VIDEO_CN));
          } else {
            setVideoSrc(sessionStorage.getItem(VIDEO_EN));
          }
        }
  
        setNowOnAir(arrNowOnAir);
        setRecommended(arrRecommended);
        setSale(arrSale);
      }
    } catch (err) {
      console.log("err: ", err);
    }
  }

  // 이미지 가져오기
  const getImages = async () => {
    try {
      // 이미지 전부 가져오기
      const images = await axios.get(`${IMAGES_SERVER}/list`);
      if (images.data.imageInfos.length > 0) {
        // isLanguage 초기값 변경경
        let tmpLanguage = "";
        if (isLanguage === "") {
          tmpLanguage = I18N_ENGLISH;
        } else {
          tmpLanguage = isLanguage;
        }

        let tmpBanner = {}, tmpPharmaceutical = {}, tmpCosmetics = {}, tmpDailyNecessaries = {}, tmpFood = {};
        // 이미지 주소 대입
        images.data.imageInfos.map((item) => {
          // 화면에 노출 가능하고 해당언어의 이미지만 추출
          if (item.visible === IMAGES_VISIBLE_ITEM[1]._id && item.language === tmpLanguage) {
            if (item.type === IMAGES_TYPE[1]._id) {
              // 배너
              setBanner(item);
              tmpBanner = item;
            } else if (item.type === IMAGES_TYPE[2]._id) {
              // 의약품
              setPharmaceutical(item);
              tmpPharmaceutical = item;
            } else if (item.type === IMAGES_TYPE[3]._id) {
              // 화장품
              setCosmetics(item);
              tmpCosmetics = item;
            } else if (item.type === IMAGES_TYPE[4]._id) {
              // 생활필수품
              setDailyNecessaries(item);
              tmpDailyNecessaries = item;
            } else if (item.type === IMAGES_TYPE[5]._id) {
              // 식품
              tmpFood = item;
              setFood(item);
            }
          }
        })

        // 해당언어의 배너 이미지가 없는경우 일단 있는걸 보여준다
        if (Object.keys(tmpBanner).length === 0) {
          images.data.imageInfos.map((item) => {
            if (item.type === IMAGES_TYPE[1]._id) {
              if (item.visible === IMAGES_VISIBLE_ITEM[1]._id) {
                setBanner(item);
              }
            }
          })
        }
        // 해당언어의 의약품 이미지가 없는경우 일단 있는걸 보여준다
        if (Object.keys(tmpPharmaceutical).length === 0) {
          images.data.imageInfos.map((item) => {
            if (item.type === IMAGES_TYPE[2]._id) {
              if (item.visible === IMAGES_VISIBLE_ITEM[1]._id) {
                setPharmaceutical(item);
              }
            }
          })
        }
        // 해당언어의 화장품 이미지가 없는경우 일단 있는걸 보여준다
        if (Object.keys(tmpCosmetics).length === 0) {
          images.data.imageInfos.map((item) => {
            if (item.type === IMAGES_TYPE[3]._id) {
              if (item.visible === IMAGES_VISIBLE_ITEM[1]._id) {
                setCosmetics(item);
              }
            }
          })
        }
        // 해당언어의 생활용품 이미지가 없는경우 일단 있는걸 보여준다
        if (Object.keys(tmpDailyNecessaries).length === 0) {
          images.data.imageInfos.map((item) => {
            if (item.type === IMAGES_TYPE[4]._id) {
              if (item.visible === IMAGES_VISIBLE_ITEM[1]._id) {
                setDailyNecessaries(item);
              }
            }
          })
        }
        // 해당언어의 식품 이미지가 없는경우 일단 있는걸 보여준다
        if (Object.keys(tmpFood).length === 0) {
          images.data.imageInfos.map((item) => {
            if (item.type === IMAGES_TYPE[5]._id) {
              if (item.visible === IMAGES_VISIBLE_ITEM[1]._id) {
                setFood(item);
              }
            }
          })
        }
      }
    } catch (err) {
      console.log("err: ", err);
    }
  }
  
  // 상품리스트 화면이동
  const handleSearchVisibleType = (type) => {
    // 화면이동시 세션의 비디오 정보 삭제
    sessionStorage.removeItem(VIDEO_JP);
    sessionStorage.removeItem(VIDEO_CN);
    sessionStorage.removeItem(VIDEO_EN);
    // type 3: 추천상품, 4: 세일상품 
    _history.push(`/product/list/${type}`);
  }

  const handleChangeVideo = (params) => {
    // 상품에 비디오 정보가 있는 경우만 세션에 값을 저장한다
    if (params.japaneseUrl && params.chineseUrl && params.englishUrl) {
      sessionStorage.setItem(VIDEO_JP, params.japaneseUrl);
      sessionStorage.setItem(VIDEO_CN, params.chineseUrl);
      sessionStorage.setItem(VIDEO_EN, params.englishUrl);
    }
    setUrl(params.japaneseUrl);
  }

  // 상품리스트로 이동(카테고리 검색)
  const handleSearchCategory = (category) => {
    // 화면이동시 세션의 비디오 정보 삭제
    sessionStorage.removeItem(VIDEO_JP);
    sessionStorage.removeItem(VIDEO_CN);
    sessionStorage.removeItem(VIDEO_EN);
    // category
    _history.push(`/product/list/category/${category}`);
  }

  // slider settings
  const settings = {
    dots: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    variableWidth: true
  };

  return (
    <div id="container">
      <main>
        {/* スライドショー（slick） */}
        <div className={styles.bg1}>
          <section>
            {/* {videoSrc &&
              <video loop controls style={{width:"100%", height:"28em", backgroundColor:"black"}} >
                <source src={videoSrc} type="video/mp4" />
              </video>
            }

            {videoSrc &&
              <iframe 
                className="video" 
                src={videoSrc} 
                width="100%" 
                height="360" 
                frameBorder="0"
                allow='autoplay; fullscreen' 
              />
            } */}

            {videoSrc &&
              <ReactPlayer 
                className="video" 
                controls={true}
                url={videoSrc}
                // url={"https://youtu.be/lKK-dFJCG60"} 
                width="100%" 
                height="360px" 
                muted={true} //chrome정책으로 인해 자동 재생을 위해 mute 옵션을 true로 해주었다.
                playing={true} 
                loop={true} />
            }

            <ul className={styles.scrollContent} >
              {nowOnAirAndRec.map((product, idx) => {
                let isNowOnAirTag = false, isRecommendedTag = false, isSaleTag = false;

                product.exposureType.map((item) => {
                  // now on air 상품인지 확인
                  if (item === PRODUCT_VISIBLE_TYPE[1].key) isNowOnAirTag = true;
                  // 추천상품인지 
                  if (item === PRODUCT_VISIBLE_TYPE[3].key) isRecommendedTag = true;
                  // 세일상품인지
                  if (item === PRODUCT_VISIBLE_TYPE[4].key) isSaleTag = true;
                })
                
                return (
                  <li key={idx}>
                    <div className={styles.scrollOnAirProduct} >
                      {/* 플레이 버튼 이미지 */}
                      <div className={styles.playButton} onClick={(e) => {handleChangeVideo(product)}}></div>
                      {/* 이미지 */}
                      <img src={product.images[0]} alt={product.englishTitle} onClick={(e) => {handleChangeVideo(product)}} />
                      {/* 현재 방송중인 태그 */}
                      {isNowOnAirTag && 
                        <p className={styles.nowOnAirTxt}>Now On Air</p> }

                      {/* 다국어 대응 */}
                      {(isLanguage === I18N_ENGLISH || isLanguage === "") && 
                        <a href={`/product/${product._id}`}>
                          <div className={styles.onAirPicName} style={{textDecoration: 'blue underline'}}>{product.englishTitle}</div>
                        </a>
                      }
                      {isLanguage === I18N_CHINESE && 
                        <a href={`/product/${product._id}`}>
                          <div className={styles.onAirPicName} style={{textDecoration: 'blue underline'}}>{product.chineseTitle}</div>
                        </a>
                      }
                      {isLanguage === I18N_JAPANESE && 
                        <a href={`/product/${product._id}`}>
                          <div className={styles.onAirPicName} style={{textDecoration: 'blue underline'}}>{product.title}</div>
                        </a>
                      }
                      {/* 세일, 추천상품 태그 */}
                      <p className={styles.onAirPicCap}>{Number(product.price).toLocaleString()} (JPY)</p>
                      {isSaleTag && 
                        <Tag className={styles.onAirSale} color="#ff0404">{SALE_TAG}</Tag> }
                      {isRecommendedTag && 
                        <Tag className={styles.onAirNotice} color="#ff8800">{NOTICE_TAG}</Tag> }
                    </div>
                  </li>
                )
              })}
            </ul>
            {/* 배너 */}
            {Banner && 
              <div>
                <img src={Banner.image} style={{ maxWidth:"100%", height:"auto" }} />
              </div>
            }   
            {/* 추천상품 */}
            { recommended.length > 0 &&
            <>
              <h2>{t('Landing.recommendTitle')}</h2>
              <Slider {...settings}>
                {recommended.map((recProduct, idx) => {

                  return (
                    <div key={idx} >
                      <div className={styles.recomProductBox} >
                        {/* 상품이미지 */}
                        <a href={`/product/${recProduct._id}`}><img src={recProduct.images[0]} /></a>
                        {/* 상품명 */}
                        {(isLanguage === I18N_ENGLISH || isLanguage === "") && 
                          <p className={styles.proNameS}>{recProduct.englishTitle}</p>
                        }
                        {isLanguage === I18N_CHINESE && 
                          <p className={styles.proNameS}>{recProduct.chineseTitle}</p>
                        }
                        {isLanguage === I18N_JAPANESE && 
                          <p className={styles.proNameS}>{recProduct.title}</p>
                        }
                        {/* 상품가격 */}
                        <p className={styles.capS}>{Number(recProduct.price).toLocaleString()} (JPY)</p>
                      
                      </div>
                    </div>
                  )
                })}
              </Slider>
              
              <div style={{ display:'flex', justifyContent:'center' }}>
                <Button 
                  type="primary" 
                  shape="round" 
                  style={{ marginTop:"50px", height:"40px", width:"40%", background:"#1a1e65" }}
                  onClick={() => handleSearchVisibleType(PRODUCT_VISIBLE_TYPE[3].key)}>
                    More
                </Button>
              </div>
            </>
            }
            {/* 세일상품 */}
            { sale.length > 0 &&
            <>
              <h2>{t('Landing.saleTitle')}</h2>
              <Slider {...settings}>
                {sale.map((salProduct, idx) => {

                  return (
                    <div key={idx} >
                      <div className={styles.saleProductBox} >
                        {/* 상품 이미지 */}
                        <a href={`/product/${salProduct._id}`}><img src={salProduct.images[0]} /></a>
                        {/* 상품명 */}
                        {(isLanguage === I18N_ENGLISH || isLanguage === "") && 
                          <p className={styles.saleNameS}>{salProduct.englishTitle}</p>
                        }
                        {isLanguage === I18N_CHINESE && 
                          <p className={styles.saleNameS}>{salProduct.chineseTitle}</p>
                        }
                        {isLanguage === I18N_JAPANESE && 
                          <p className={styles.saleNameS}>{salProduct.title}</p>
                        }
                        {/* 상품가격 */}
                        <p className={styles.salecapS}>{Number(salProduct.price).toLocaleString()} (JPY)</p>
                      </div>
                    </div>
                  )
                })}
              </Slider>
              
              <div style={{ display:'flex', justifyContent:'center' }}>
                <Button 
                  type="primary" 
                  shape="round" 
                  style={{ marginTop:"50px", height:"40px", width:"40%", background:"#1a1e65" }}
                  onClick={() => handleSearchVisibleType(PRODUCT_VISIBLE_TYPE[4].key)}>
                    More
                </Button>
              </div>
            </>
            }
            {/* <!--/.list-container-->  */}
            <h2>{t('Landing.itemTitle')}</h2>
            
            <div className={styles.itemlistContent}>
              {Pharmaceutical && 
                <div className={styles.itemlistBox}>
                  <div className={styles.itemlistImage}>
                    <img src={Pharmaceutical.image} style={{ maxWidth: "100%", height: "auto" }} onClick={(e) => {handleSearchCategory(MAIN_CATEGORY[2].key)}} />
                  </div>
                  <div className={styles.itemlistProduct}>{t('Landing.pharmaceuticalsTitle')}
                    <p className={styles.itemlistText} >{Pharmaceutical.description}</p>
                  </div>
                </div>
              }
              {Cosmetics &&
                <div className={styles.itemlistBox}>
                  <div className={styles.itemlistImage}>
                    <img src={Cosmetics.image} style={{ maxWidth: "100%", height: "auto" }} onClick={(e) => {handleSearchCategory(MAIN_CATEGORY[1].key)}}/>
                  </div>
                  <div className={styles.itemlistProduct}>{t('Landing.cosmeticsTitle')}
                    <p className={styles.itemlistText} >{Cosmetics.description}</p>
                  </div>
                </div>
              }
              {DailyNecessaries &&
                <div className={styles.itemlistBox}>
                  <div className={styles.itemlistImage}>
                    <img src={DailyNecessaries.image} style={{ maxWidth: "100%", height: "auto" }} onClick={(e) => {handleSearchCategory(MAIN_CATEGORY[4].key)}} />
                  </div>
                  <div className={styles.itemlistProduct}>{t('Landing.dailyNecessariesTitle')}
                    <p className={styles.itemlistText} >{DailyNecessaries.description}</p>
                  </div>
                </div>
              }
              {Food && 
                <div className={styles.itemlistBox}>
                  <div className={styles.itemlistImage}>
                    <img src={Food.image} style={{ maxWidth: "100%", height: "auto" }} onClick={(e) => {handleSearchCategory(MAIN_CATEGORY[3].key)}} />
                  </div>
                  <div className={styles.itemlistProduct}>{t('Landing.foodTitle')}
                    <p className={styles.itemlistText} >{Food.description}</p>
                  </div>
                </div> 
              }
            </div>
          </section>

        </div>
      </main>
    </div>
  )
}

export default LandingPage;