import { useEffect, useState } from 'react'
import axios from 'axios'
import PropTypes from 'prop-types';
import Swal from 'sweetalert2';

const { VITE_API_BASE, VITE_API_PATH } = import.meta.env

const Loading = ({isLoading}) => {
  return (
    <div className="loading" style={{
      display: isLoading ? 'flex' : 'none'
    }}>
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>  
    </div>
  )
}
Loading.propTypes = {
  isLoading: PropTypes.bool.isRequired,
};

function App() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [isAuth, setIsAuth] = useState(false);
  const [products, setProducts] = useState([]);
  const [tempProduct, setTempProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState("");

  // 帳號密碼更新狀態
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((state) => ({ ...state, [name]:value }));
  }

  // 登入驗證
  const loginFn = async() => {
    try {
      setIsLoading(true);
      const result = await axios.post(`${VITE_API_BASE}/admin/signin`, formData)
      const { token, expired } = result.data
      document.cookie = `hexToken=${token}; expires=${new Date(expired)}; path=/`
      setToken(token);
      setIsAuth(true)
      Swal.fire({
        title: "登入成功",
        icon: "success"
      });
      getProductsData(token)
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "登入失敗",
        text: error
      });
    } finally {
      setIsLoading(false)
    }
  }
  // 取得產品資料函式
  const getProductsData = async (savedToken) => {
    try {
      setIsLoading(true);
      const result = await axios.get(`${VITE_API_BASE}/api/${VITE_API_PATH}/admin/products/all`, {
        headers: {
          Authorization: savedToken || token,
        },
      })
      const { products } = result.data
      setProducts(products)
    } catch (error) {
      console.log('錯誤', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 取得產品資料
  useEffect (() => {
    const savedToken = document.cookie.replace(/(?:(?:^|.*;\s*)hexToken\s*=\s*([^;]*).*$)|^.*$/,'$1')
    if(savedToken) {
      setToken(savedToken)
      setIsAuth(true)
      getProductsData(savedToken)
    }
  }, [])

  return (
    <>
      <Loading isLoading={isLoading} />
      {isAuth ? (
        <div className="container">
          <div className="row mt-5">
            <div className="col-md-6">
              <h2>產品列表</h2>
              <table className="table">
                <thead>
                  <tr>
                    <th>產品名稱</th>
                    <th>原價</th>
                    <th>售價</th>
                    <th>是否啟用</th>
                    <th>查看細節</th>
                  </tr>
                </thead>
                <tbody>
                  {products && Object.values(products).length > 0 ? (
                    Object.values(products).map((item) => (
                      <tr key={item.id}>
                        <td>{item.title}</td>
                        <td>{item.origin_price}</td>
                        <td>{item.price}</td>
                        <td>{item.is_enabled ? "啟用" : "未啟用"}</td>
                        <td>
                          <button
                            className="btn btn-primary"
                            onClick={() => setTempProduct(item)}
                          >
                            查看細節
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5">尚無產品資料</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="col-md-6">
              <h2>單一產品細節</h2>
              {tempProduct ? (
                <div className="card mb-3">
                  <img
                    src={tempProduct.imageUrl}
                    className="card-img-top primary-image"
                    alt="主圖"
                  />
                  <div className="card-body">
                    <h5 className="card-title">
                      {tempProduct.title}
                      <span className="badge bg-primary ms-2">
                        {tempProduct.category}
                      </span>
                    </h5>
                    <p className="card-text">
                      商品描述：{tempProduct.description}
                    </p>
                    <p className="card-text">商品內容：{tempProduct.content}</p>
                    <div className="d-flex">
                      <p className="card-text text-secondary">
                        <del>{tempProduct.origin_price}</del>
                      </p>
                      元 / {tempProduct.price} 元
                    </div>
                    <h5 className="mt-3">更多圖片：</h5>
                    <div className="d-flex flex-wrap">
                      {tempProduct.imagesUrl?.map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          className="images"
                          alt="副圖"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-secondary">請選擇一個商品查看</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="container login">
          <div className="row justify-content-center">
            <h1 className="h3 mb-3 font-weight-normal">請先登入</h1>
            <div className="col-8">
              <form id="form" className="form-signin">
                <div className="form-floating mb-3">
                  <input
                    type="email"
                    name="username"
                    className="form-control"
                    id="username"
                    placeholder="name@example.com"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    autoFocus
                  />
                  <label htmlFor="username">Email address</label>
                </div>
                <div className="form-floating">
                  <input
                    type="password"
                    name="password"
                    className="form-control"
                    id="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  <label htmlFor="password">Password</label>
                </div>
                <button
                  className="btn btn-lg btn-primary w-100 mt-3"
                  type="button"
                  onClick={loginFn}
                >
                  登入
                </button>
              </form>
            </div>
          </div>
          <p className="mt-5 mb-3 text-muted">&copy; 2024~∞ - 六角學院</p>
        </div>
      )}
    </>
  );
}

export default App
