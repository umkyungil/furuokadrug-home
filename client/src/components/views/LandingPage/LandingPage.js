import React, { useState, useEffect, useContext } from "react";
import styles from './LandingPage.module.css';
import Slider from "react-slick";
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { PRODUCT_SERVER, IMAGES_SERVER } from '../../Config.js';
import { PRODUCT_VISIBLE_TYPE, IMAGES_TYPE, I18N_ENGLISH, I18N_JAPANESE, I18N_CHINESE, IMAGES_VISIBLE_ITEM, 
  VIDEO_ENGLISH, VIDEO_JAPANESE, VIDEO_CHINESE, SALE_TAG, NOTICE_TAG  } from '../../utils/Const';
import { Button, Tag } from 'antd';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageContext } from '../../context/LanguageContext';
import axios from 'axios';
// CORS 대책
axios.defaults.withCredentials = true;

function LandingPage() {
  const history = useHistory();

  const [nowOnAir, setNowOnAir] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [sale, setSale] = useState([]);
  const [Banner, setBanner] = useState({});
  const [Pharmaceutical, setPharmaceutical] = useState({});
  const [Cosmetics, setCosmetics] = useState({});
  const [DailyNecessaries, setDailyNecessaries] = useState({});
  const [Food, setFood] = useState({});
  

  const {t, i18n} = useTranslation();
  const {isLanguage} = useContext(LanguageContext);

  useEffect(() => {
    i18n.changeLanguage(isLanguage);
    process();
  },[]);

  const process = async () => {
    // 노출상풍을 가져오기
    await getExposureProducts(); // type 1:now on air, type 2:recording, type 3: recommended, type 4: sale
    // 이미지 가져오기
    await getImages(); // visible 0:private, visible:public
  }

  
	const truncate = (str, n) => {
		return str?.length > n ? str.substr(0, n-1) + "..." : str;
	}
  
  // 노출상풍을 가져오기
  const getExposureProducts = async () => {
    const body = { 
      skip: 0, limit: 4, 
      type: [
        PRODUCT_VISIBLE_TYPE[1].key, PRODUCT_VISIBLE_TYPE[2].key, PRODUCT_VISIBLE_TYPE[3].key, PRODUCT_VISIBLE_TYPE[4].key
      ]
    }
    const products =  await axios.post(`${PRODUCT_SERVER}/products_by_type`, body);
    
    if (products.data.productInfos.length > 0) {
      let arrNowOnAir = [], arrRecommended = [], arrSale = [];

      console.log("products.data.productInfos: ", products.data.productInfos)
      
      products.data.productInfos.map((product) => {
        for (let i = 0; i < product.exposureType.length; i++) {
          // 일반상품: 0, 방송상품: 1, 동영상 존재 상품: 2, 추천상품: 3, 세일상품: 4
          // 1: 방송상품(now on sale)과 2: recording가 같이 등록된 상품은 없기에 같은 배열에 넣어도 상품이 중복안된다
          if (product.exposureType[i] === PRODUCT_VISIBLE_TYPE[1].key) {
            arrNowOnAir.push(product);
          } else if (product.exposureType[i] === PRODUCT_VISIBLE_TYPE[2].key) {
            arrNowOnAir.push(product);
          } else if (product.exposureType[i] === PRODUCT_VISIBLE_TYPE[3].key) {
            arrRecommended.push(product);
          } else if (product.exposureType[i] === PRODUCT_VISIBLE_TYPE[4].key) {
            arrSale.push(product);
          }
        }
      });
      setNowOnAir(arrNowOnAir);
      setRecommended(arrRecommended);
      setSale(arrSale);
    }
  }

  // 이미지 가져오기
  const getImages = async () => {
    const images = await axios.get(`${IMAGES_SERVER}/list`);

    if (images.data.imageInfos.length > 0) {
      images.data.imageInfos.map((item) => {
        if (item.visible === IMAGES_VISIBLE_ITEM[1]._id) {
          if (item.type === IMAGES_TYPE[1]._id) {
            console.log("banner: " + JSON.stringify(item));
            setBanner(() => item);
          } else if (item.type === IMAGES_TYPE[2]._id) {
            setPharmaceutical(() => item);;
          } else if (item.type === IMAGES_TYPE[3]._id) {
            setCosmetics(() => item);;
          } else if (item.type === IMAGES_TYPE[4]._id) {
            setDailyNecessaries(() => item);;
          } else if (item.type === IMAGES_TYPE[5]._id) {
            setFood(() => item);;
          }
        }
      })
    }
  }
  
  // 상품리스트 화면이동
  const handleProductList = (type) => {
    // type 0: 일반상품, 1: Now on air, 2: 추천상품, 3: 세일상품 
    history.push(`/product/list/${type}`);
  }

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
            <video autoPlay loop controls style={{width:"100%", height:"28em", backgroundColor:"black"}} >
              {isLanguage === I18N_ENGLISH && 
                <source src={VIDEO_ENGLISH} type="video/mp4" />
              }
              {isLanguage === I18N_CHINESE && 
                <source src={VIDEO_CHINESE} type="video/mp4" />
              }
              {(isLanguage === I18N_JAPANESE || isLanguage === "") && 
                <source src={VIDEO_JAPANESE} type="video/mp4" />
              }
            </video>

            <ul className={styles.scrollContent} >
              {nowOnAir.map((nowProduct, idx) => {
                
                let isOnAirTag = false;
                let isRecommendedTag = false;
                let isSaleTag = false;
                nowProduct.exposureType.map((item) => {
                  // now on air 상품인지 확인
                  if (item === PRODUCT_VISIBLE_TYPE[1].key) isOnAirTag = true;
                  // 추천상품인지 
                  if (item === PRODUCT_VISIBLE_TYPE[3].key) isRecommendedTag = true;
                  // 세일상품인지
                  if (item === PRODUCT_VISIBLE_TYPE[4].key) isSaleTag = true;
                })
                
                return (
                  <li key={idx}>
                    <div className={styles.scrollOnAirProduct} >
                      <img src={nowProduct.images[0]} alt={nowProduct.englishTitle} />
                      {isOnAirTag && <p className={styles.nowOnAirTxt}>Now On Air</p>}
                      {isLanguage === I18N_ENGLISH && 
                        <div className={styles.onAirPicName}>{nowProduct.englishTitle}</div>
                      }
                      {isLanguage === I18N_CHINESE && 
                        <div className={styles.onAirPicName}>{nowProduct.chineseTitle}</div>
                      }
                      {(isLanguage === I18N_JAPANESE || isLanguage === "") && 
                        <div className={styles.onAirPicName}>{nowProduct.title}</div>
                      }
                      <p className={styles.onAirPicCap}>{Number(nowProduct.price).toLocaleString()} (JPY)</p>
                      {isSaleTag &&
                        <Tag className={styles.onAirSale} color="#f50">{SALE_TAG}</Tag>
                        // <button className={styles.onAirSale}>sale</button>
                      }
                      {isRecommendedTag &&
                        <Tag className={styles.onAirNotice} color="#2db7f5">{NOTICE_TAG}</Tag>
                        // <button className={styles.onAirNotice}>notice</button>
                      }
                    </div>
                  </li>
                )
              })}
            </ul>
            {/* 배너 */}
            { Banner &&
              <div>
                <img src={Banner.image} style={{ maxWidth:"100%", height:"auto" }} />
              </div>
            }

            { recommended.length > 0 &&
            <>
              <h2>{t('Landing.recommendTitle')}</h2>
                <Slider {...settings}>
                  {recommended.map((recProduct, idx) => {

                    return (
                      <div key={idx} >
                        <div className={styles.recomProductBox} >
                          <img src={recProduct.images[0]} />
                          {isLanguage === I18N_ENGLISH && 
                            <p className={styles.proNameS}>{recProduct.englishTitle}</p>
                          }
                          {isLanguage === I18N_CHINESE && 
                            <p className={styles.proNameS}>{recProduct.chineseTitle}</p>
                          }
                          {(isLanguage === I18N_JAPANESE || isLanguage === "") && 
                            <p className={styles.proNameS}>{recProduct.title}</p>
                          }

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
                  onClick={() => handleProductList(1)}>
                    More
                </Button>
              </div>
            </>
            }

            { sale.length > 0 &&
            <>
              <h2>{t('Landing.saleTitle')}</h2>
              
                <Slider {...settings}>
                  {sale.map((salProduct, idx) => {

                    return (
                      <div key={idx} >
                        <div className={styles.saleProductBox} >
                          <img src={salProduct.images[0]} />
                          {isLanguage === I18N_ENGLISH && 
                            <p className={styles.saleNameS}>{salProduct.englishTitle}</p>
                          }
                          {isLanguage === I18N_CHINESE && 
                            <p className={styles.saleNameS}>{salProduct.chineseTitle}</p>
                          }
                          {(isLanguage === I18N_JAPANESE || isLanguage === "") && 
                            <p className={styles.saleNameS}>{salProduct.title}</p>
                          }

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
                  onClick={() => handleProductList(1)}>
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
                    <img src={Pharmaceutical.image} style={{ maxWidth: "100%", height: "auto" }} />
                  </div>
                  <div className={styles.itemlistProduct}>{t('Landing.pharmaceuticalsTitle')}
                    <p className={styles.itemlistText} >{Pharmaceutical.description}</p>
                  </div>
                </div>
              }
              {Cosmetics &&
                <div className={styles.itemlistBox}>
                  <div className={styles.itemlistImage}>
                    <img src={Cosmetics.image} style={{ maxWidth: "100%", height: "auto" }} />
                  </div>
                  <div className={styles.itemlistProduct}>{t('Landing.cosmeticsTitle')}
                    <p className={styles.itemlistText} >{Cosmetics.description}</p>
                  </div>
                </div>
              }
              {DailyNecessaries &&
                <div className={styles.itemlistBox}>
                  <div className={styles.itemlistImage}>
                    <img src={DailyNecessaries.image} style={{ maxWidth: "100%", height: "auto" }} />
                  </div>
                  <div className={styles.itemlistProduct}>{t('Landing.dailyNecessariesTitle')}
                    <p className={styles.itemlistText} >{DailyNecessaries.description}</p>
                  </div>
                </div>
              }
              {Food && 
                <div className={styles.itemlistBox}>
                  <div className={styles.itemlistImage}>
                    <img src={Food.image} style={{ maxWidth: "100%", height: "auto" }} />
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