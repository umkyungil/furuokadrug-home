import React, { useState, useEffect, useContext } from "react";
import styles from './LandingPage.module.css';
import Slider from "react-slick";
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { PRODUCT_SERVER, IMAGES_SERVER, CODE_SERVER } from '../../Config.js';
import { MAIN_CATEGORY, PRODUCT_VISIBLE_TYPE, IMAGES_TYPE, I18N_ENGLISH, I18N_JAPANESE, I18N_CHINESE, IMAGES_VISIBLE_ITEM, 
        SALE_TAG, NOTICE_TAG, VIDEO_JP, VIDEO_CN, VIDEO_EN } from '../../utils/Const';
import { Button, Tag } from 'antd';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageContext } from '../../context/LanguageContext';
import ReactPlayer from 'react-player'
import axios from 'axios';
// CORS 대책
axios.defaults.withCredentials = true;

function LandingPage() {
  const [videoSrc, setVideoSrc] = useState("");
  const [nowOnAirAndRec, setNowOnAirAndRec] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [sale, setSale] = useState([]);
  const [Banner, setBanner] = useState({});
  const [Pharmaceutical, setPharmaceutical] = useState({});
  const [Cosmetics, setCosmetics] = useState({});
  const [DailyNecessaries, setDailyNecessaries] = useState({});
  const [Food, setFood] = useState({});
  const [Baby, setBaby] = useState({});
  const [Pet, setPet] = useState({});
  const [url, setUrl] = useState("");

  const _history = useHistory();
  const {t, i18n} = useTranslation();
  const {isLanguage, setIsLanguage} = useContext(LanguageContext);
    
  useEffect(() => {
    if (!isLanguage || isLanguage === "") {
      const i18 = localStorage.getItem("i18nextLng");
      
      if (i18) {
        if (i18 === 'ja-JP') {
          setIsLanguage('en');
          localStorage.setItem('i18nextLng', 'en');
          i18n.changeLanguage('en');
        } else {
          setIsLanguage(i18);
          i18n.changeLanguage(i18);
        }
      } else {
        setIsLanguage('en');
        localStorage.setItem('i18nextLng', 'en');
        i18n.changeLanguage('en');
      }
    }

    // 노출상풍을 가져오기
    getProducts(); // type 1:now on air, type 2:recording, type 3: recommended, type 4: sale
    // 이미지 가져오기
    getImages(); // visible 0:private, visible:public
    // 포인트 적용율 가져오기
    getPointRate();
  },[url]);

  // 포인트비율은 한번만 가져오게 한다
  useEffect(() => {
    getPointRate();
  },[]);

  // 빈 객체인 경우 true, 속성이 있는경우 false
  function isEmptyObj(obj)  {
    // 객체 타입체크
    if(obj.constructor !== Object)  {
      return false;
    }
    
    // property 체크
    for(let prop in obj)  {
      if(obj.hasOwnProperty(prop))  {
        return false;
      }
    }
    
    return true;
  }

  // 포인트 적용률정보 가져오기
  const getPointRate = async () => {
    try {
      const pointRate = await axios.get(`${CODE_SERVER}/code_by_code?code=POINT`);
      // 세션에 저장
      if (pointRate.data.success) {
        sessionStorage.setItem("pointRate", pointRate.data.codeInfo.value1);
      }
    } catch (err) {
      alert('Please contact the administrator');
      console.log("err: ",err);
    }
  }

  // 노출상풍을 가져오기
  const getProducts = async () => {
    try {
      // Landing page 상품 가져오기(회원및 비회원을 구분하기 위해 사용자ID를 파라메터로 넘김)
      const userId  = localStorage.getItem("userId");
      const allProducts = await axios.get(`${PRODUCT_SERVER}/all_products_by_type?id=${userId}`);
      const recdTypeProducts = allProducts.data.productInfos[0]; // now on sale과 recording상품 가져오기
      const recTypeProducts = allProducts.data.productInfos[1]; // 추천상품 가져오기
      const saleTypeProducts = allProducts.data.productInfos[2]; // 세일상품 가져오기
      
      let arrRecd = [], arrNowOnAir = [];
      if (recdTypeProducts.length > 0) {
        recdTypeProducts.map((product) => {
          for (let i = 0; i < product.exposureType.length; i++) {
            // 일반상품: 0, 방송상품: 1, 동영상 존재 상품: 2, 
            // 1: 방송상품(now on sale)과 2: recording은 같이 등록된 상품이 없기에 같은 배열에 넣어도 상품이 중복안된다
            if (product.exposureType[i] === PRODUCT_VISIBLE_TYPE[1].key) {
              arrNowOnAir.push(product);
            } else if (product.exposureType[i] === PRODUCT_VISIBLE_TYPE[2].key) {
              arrRecd.push(product);
            }
          }
        });
        // now on air상품을 먼저 보여주기위해 정렬
        setNowOnAirAndRec([...arrNowOnAir, ...arrRecd]);
      }

      // 추천상품
      if (recTypeProducts.length > 0) {
        setRecommended(recTypeProducts);
      }
      // 세일상품
      if (saleTypeProducts.length > 0) {
        setSale(saleTypeProducts);
      }
        
      // 언어별 비디오 정보가 세션에 하나라도 없으면 로컬스토리지에 설정된 언어의 비디오 정보를 세팅하던가 없으면 영어 비디오 정보를 셋팅한다
      if (!sessionStorage.getItem(VIDEO_JP) || !sessionStorage.getItem(VIDEO_CN) || !sessionStorage.getItem(VIDEO_EN)) {
        if (isLanguage === I18N_JAPANESE) {
          if (arrNowOnAir[0].japaneseUrl) {
            setVideoSrc(arrNowOnAir[0].japaneseUrl);
          } else {
            setVideoSrc(arrNowOnAir[0].englishUrl);
          }
        } else if (isLanguage === I18N_CHINESE) {
          if (arrNowOnAir[0].chineseUrl) {
            setVideoSrc(arrNowOnAir[0].chineseUrl);
          } else {
            setVideoSrc(arrNowOnAir[0].englishUrl);
          }
        } else {
          setVideoSrc(arrNowOnAir[0].englishUrl);
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

        let tmpBanner={}, tmpPharmaceutical={}, tmpCosmetics={}, tmpDailyNecessaries={}, tmpFood={}, tmpBaby={}, tmpPet={};
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
              setFood(item);
              tmpFood = item;
            } else if (item.type === IMAGES_TYPE[6]._id) {
              // 아기용품
              tmpBaby = item;
              setBaby(item);
            } else if (item.type === IMAGES_TYPE[7]._id) {
              // 애완동물
              tmpPet = item;
              setPet(item);
            }
          }
        })

        // 해당언어의 배너 이미지가 없는경우 일단 있는걸 보여준다
        if (isEmptyObj(tmpBanner)) {
          images.data.imageInfos.map((item) => {
            if (item.type === IMAGES_TYPE[1]._id) {
              if (item.visible === IMAGES_VISIBLE_ITEM[1]._id) {
                setBanner(item);
              }
            }
          })
        }
        // 해당언어의 의약품 이미지가 없는경우 일단 있는걸 보여준다
        if (isEmptyObj(tmpPharmaceutical)) {
          images.data.imageInfos.map((item) => {
            if (item.type === IMAGES_TYPE[2]._id) {
              if (item.visible === IMAGES_VISIBLE_ITEM[1]._id) {
                setPharmaceutical(item);
              }
            }
          })
        }
        // 해당언어의 화장품 이미지가 없는경우 일단 있는걸 보여준다
        if (isEmptyObj(tmpCosmetics)) {
          images.data.imageInfos.map((item) => {
            if (item.type === IMAGES_TYPE[3]._id) {
              if (item.visible === IMAGES_VISIBLE_ITEM[1]._id) {
                setCosmetics(item);
              }
            }
          })
        }
        // 해당언어의 생활용품 이미지가 없는경우 일단 있는걸 보여준다
        if (isEmptyObj(tmpDailyNecessaries)) {
          images.data.imageInfos.map((item) => {
            if (item.type === IMAGES_TYPE[4]._id) {
              if (item.visible === IMAGES_VISIBLE_ITEM[1]._id) {
                setDailyNecessaries(item);
              }
            }
          })
        }
        // 해당언어의 식품 이미지가 없는경우 일단 있는걸 보여준다
        if (isEmptyObj(tmpFood)) {
          images.data.imageInfos.map((item) => {
            if (item.type === IMAGES_TYPE[5]._id) {
              if (item.visible === IMAGES_VISIBLE_ITEM[1]._id) {
                setFood(item);
              }
            }
          })
        }
        // 해당언어의 아기용품 이미지가 없는경우 일단 있는걸 보여준다
        if (isEmptyObj(tmpBaby)) {
          images.data.imageInfos.map((item) => {
            if (item.type === IMAGES_TYPE[6]._id) {
              if (item.visible === IMAGES_VISIBLE_ITEM[1]._id) {
                setBaby(item);
              }
            }
          })
        }
        // 해당언어의 애완동물 이미지가 없는경우 일단 있는걸 보여준다
        if (isEmptyObj(tmpPet)) {
          images.data.imageInfos.map((item) => {
            if (item.type === IMAGES_TYPE[7]._id) {
              if (item.visible === IMAGES_VISIBLE_ITEM[1]._id) {
                setPet(item);
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
                      <img src={product.images[0]} onClick={(e) => {handleChangeVideo(product)}} alt='product'/>
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
                      {/* 상품가격 */}
                      <p className={styles.onAirPicCap}>{Number(product.price).toLocaleString()} (JPY)</p>
                      {/* 세일, 추천상품 태그 */}
                      {isSaleTag && <Tag className={styles.onAirSaleTag} color="#ff0404">{SALE_TAG}</Tag> }
                      {isRecommendedTag && <Tag className={styles.onAirNoticeTag} color="#ff8800">{NOTICE_TAG}</Tag> }
                    </div>
                  </li>
                )
              })}
            </ul>
            {/* 배너 */}
            {Banner && 
              <div>
                <img src={Banner.image} style={{ maxWidth:"100%", height:"auto" }} alt='banner' />
              </div>
            }   
            {/* 추천상품 */}
            { recommended.length > 0 &&
            <>
              <h2>{t('Landing.recommendTitle')}</h2>
              <Slider {...settings}>
                {recommended.map((recProduct, idx) => {

                  let isRecommendedTag = false, isSaleTag = false;
                  recProduct.exposureType.map((item) => {
                    // 추천상품인지 
                    if (item === PRODUCT_VISIBLE_TYPE[3].key) isRecommendedTag = true;
                    // 세일상품인지
                    if (item === PRODUCT_VISIBLE_TYPE[4].key) isSaleTag = true;
                  })

                  return (
                    <div key={idx} >
                      <div className={styles.recomProductBox} >
                        {/* 상품이미지 */}
                        <a href={`/product/${recProduct._id}`}><img src={recProduct.images[0]} alt='product'/></a>
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
                        {/* 세일, 추천상품 태그 */}
                        {isSaleTag && <Tag className={styles.saleTag} color="#ff0404">{SALE_TAG}</Tag> }
                        {isRecommendedTag && <Tag className={styles.noticeTag} color="#ff8800">{NOTICE_TAG}</Tag> }
                      
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
                  let isRecommendedTag = false, isSaleTag = false;
                  salProduct.exposureType.map((item) => {
                    // 추천상품인지 
                    if (item === PRODUCT_VISIBLE_TYPE[3].key) isRecommendedTag = true;
                    // 세일상품인지
                    if (item === PRODUCT_VISIBLE_TYPE[4].key) isSaleTag = true;
                  })

                  return (
                    <div key={idx} >
                      <div className={styles.saleProductBox} >
                        {/* 상품 이미지 */}
                        <a href={`/product/${salProduct._id}`}><img src={salProduct.images[0]} alt='product' /></a>
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
                        <p className={styles.saleCapS}>{parseInt(salProduct.price).toLocaleString()} (JPY)</p>
                        {/* 세일, 추천상품 태그 */}
                        {isSaleTag && <Tag className={styles.saleTag} color="#ff0404">{SALE_TAG}</Tag> }
                        {isRecommendedTag && <Tag className={styles.noticeTag} color="#ff8800">{NOTICE_TAG}</Tag> }
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
              {!isEmptyObj(Pharmaceutical) && 
                <div className={styles.itemlistBox}>
                  <div className={styles.itemlistImage}>
                    <img src={Pharmaceutical.image} style={{ maxWidth: "100%", height: "auto" }} 
                      onClick={() => {handleSearchCategory(MAIN_CATEGORY[2].key)}} alt='product' />
                  </div>
                  <div className={styles.itemlistProduct}>
                    {t('Landing.pharmaceuticalsTitle')}
                  </div>
                </div>
              }
              {!isEmptyObj(Cosmetics) &&
                <div className={styles.itemlistBox}>
                  <div className={styles.itemlistImage}>
                    <img src={Cosmetics.image} style={{ maxWidth: "100%", height: "auto" }} 
                      onClick={() => {handleSearchCategory(MAIN_CATEGORY[1].key)}} alt='product' />
                  </div>
                  <div className={styles.itemlistProduct}>
                    {t('Landing.cosmeticsTitle')}
                  </div>
                </div>
              }
              {!isEmptyObj(DailyNecessaries) &&
                <div className={styles.itemlistBox}>
                  <div className={styles.itemlistImage}>
                    <img src={DailyNecessaries.image} style={{ maxWidth: "100%", height: "auto" }} 
                      onClick={() => {handleSearchCategory(MAIN_CATEGORY[4].key)}} alt='product' />
                  </div>
                  <div className={styles.itemlistProduct}>
                    {t('Landing.dailyNecessariesTitle')}
                  </div>
                </div>
              }
              {!isEmptyObj(Food) && 
                <div className={styles.itemlistBox}>
                  <div className={styles.itemlistImage}>
                    <img src={Food.image} style={{ maxWidth: "100%", height: "auto" }} 
                      onClick={() => {handleSearchCategory(MAIN_CATEGORY[3].key)}} alt='product' />
                  </div>
                  <div className={styles.itemlistProduct}>
                    {t('Landing.foodTitle')}
                  </div>
                </div> 
              }
              {!isEmptyObj(Baby) && 
                <div className={styles.itemlistBox}>
                  <div className={styles.itemlistImage}>
                    <img src={Baby.image} style={{ maxWidth: "100%", height: "auto" }} 
                      onClick={() => {handleSearchCategory(MAIN_CATEGORY[5].key)}} alt='product' />
                  </div>
                  <div className={styles.itemlistProduct}>
                    {t('Landing.babyTitle')}
                  </div>
                </div> 
              }
              {!isEmptyObj(Pet) && 
                <div className={styles.itemlistBox}>
                  <div className={styles.itemlistImage}>
                    <img src={Pet.image} style={{ maxWidth: "100%", height: "auto" }} 
                      onClick={() => {handleSearchCategory(MAIN_CATEGORY[6].key)}} alt='product' />
                  </div>
                  <div className={styles.itemlistProduct}>
                    {t('Landing.petTitle')}                  
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