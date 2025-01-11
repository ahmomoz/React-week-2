import { useEffect, useState, useRef } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import Swal from "sweetalert2";
import * as bootstrap from "bootstrap";

const { VITE_API_BASE, VITE_API_PATH } = import.meta.env;

const Loading = ({ isLoading }) => {
  return (
    <div
      className="loading"
      style={{
        display: isLoading ? "flex" : "none",
      }}
    >
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
};
Loading.propTypes = {
  isLoading: PropTypes.bool.isRequired,
};

function App() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // modal
  const [modalType, setModalType] = useState(false);
  const myModal = useRef(null);
  const productModalRef = useRef(null);
  const openModal = (product, type) => {
    if (type === "add") {
      setTemProduct(initialProductState);
    } else {
      setTemProduct({
        id: product.id || "",
        imageUrl: product.imageUrl || "",
        imagesUrl: product.imagesUrl || [],
        title: product.title || "",
        feature: product.feature || "",
        nation: product.nation || "",
        area: product.area || "",
        address: product.address || "",
        addressEmbedCode: product.addressEmbedCode || "",
        category: product.category || "",
        unit: product.unit || "",
        origin_price: product.origin_price || 0,
        price: product.price || 0,
        description: product.description || "",
        content: product.content || "",
        is_enabled: product.is_enabled || false,
      });
    }
    myModal.current.show();
    setModalType(type);
  };
  const hideModal = () => {
    myModal.current.hide();
  };

  // 帳號密碼更新狀態
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((state) => ({ ...state, [name]: value }));
  };
  // 新增產品資料 input 更新狀態
  const handleProductInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    setTemProduct((preData) => ({
      ...preData,
      [id]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? Number(value)
          : value,
    }));
  };
  // 新增產品資料 圖片更新
  const handleImageChange = (value, index) => {
    setTemProduct((preData) => {
      const images = [...preData.imagesUrl];
      images[index] = value;

      if (value !== "" && index === images.length - 1 && images.length < 5) {
        images.push("");
      }

      if (images.length > 1 && images[images.length - 1] === "") {
        images.pop();
      }

      return { ...preData, imagesUrl: images };
    });
  };
  // 圖片增加減少
  const handleAddImg = () => {
    setTemProduct((preData) => ({
      ...preData,
      imagesUrl: [...preData.imagesUrl, ""],
    }));
  };
  const handleRemoveImg = () => {
    setTemProduct((preData) => {
      const images = [...preData.imagesUrl];
      images.pop();
      return { ...preData, imagesUrl: images };
    });
  };

  // 登入功能與登入驗證
  const [isAuth, setIsAuth] = useState(false);
  // 登入
  const loginFn = async () => {
    try {
      setIsLoading(true);
      const result = await axios.post(
        `${VITE_API_BASE}/admin/signin`,
        formData
      );
      const { token, expired } = result.data;
      document.cookie = `hexToken=${token}; expires=${new Date(
        expired
      )}; path=/`;
      axios.defaults.headers.common.Authorization = token;
      setIsAuth(true);
      Swal.fire({
        title: "登入成功",
        icon: "success",
      });
      getProductsData();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "登入失敗",
        text: error,
      });
    } finally {
      setIsLoading(false);
    }
  };
  const loginCheck = async (token) => {
    try {
      setIsLoading(true);
      axios.defaults.headers.common.Authorization = token;
      await axios.post(`${VITE_API_BASE}/api/user/check`);
      setIsAuth(true);
      await getProductsData();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "驗證錯誤",
        text: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 產品處理
  // 取得產品資料函式
  const getProductsData = async () => {
    try {
      setIsLoading(true);
      const result = await axios.get(
        `${VITE_API_BASE}/api/${VITE_API_PATH}/admin/products/all`
      );
      const { products } = result.data;
      setProducts(products);
      console.log(products);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: error.response.data.message,
      });
    } finally {
      setIsLoading(false);
    }
  };
  const initialProductState = {
    imageUrl: "",
    imagesUrl: [],
    title: "",
    feature: "",
    nation: "",
    area: "",
    address: "",
    addressEmbedCode: "",
    category: "",
    unit: "",
    origin_price: 0,
    price: 0,
    description: "",
    content: "",
    is_enabled: false,
  };
  const [temProduct, setTemProduct] = useState(initialProductState);
  // 新增產品函式
  const addProductsData = async () => {
    try {
      setIsLoading(true);
      await axios.post(`${VITE_API_BASE}/api/${VITE_API_PATH}/admin/product`, {
        data: temProduct,
      });
      Swal.fire({
        title: "產品新增成功",
        icon: "success",
      });
      hideModal();
      getProductsData();
      setTemProduct(initialProductState); // 清空新增商品欄位 (回到初始值)
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: error.response.data.message,
      });
    } finally {
      setIsLoading(false);
    }
  };
  // 編輯產品函式
  const editProductsData = async (id) => {
    try {
      setIsLoading(true);
      await axios.put(
        `${VITE_API_BASE}/api/${VITE_API_PATH}/admin/product/${id}`,
        {
          data: temProduct,
        }
      );
      Swal.fire({
        title: "產品更新成功",
        icon: "success",
      });
      hideModal();
      getProductsData();
      setTemProduct(initialProductState); // 清空新增商品欄位 (回到初始值)
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: error.response.data.message,
      });
    } finally {
      setIsLoading(false);
    }
  };
  // 刪除產品函式
  const deleteProductsData = (id) => {
    Swal.fire({
      title: "確定要刪除嗎？",
      showCancelButton: true,
      confirmButtonText: "刪除",
      denyButtonText: "不要刪除",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setIsLoading(true);
          await axios.delete(
            `${VITE_API_BASE}/api/${VITE_API_PATH}/admin/product/${id}`
          );
          Swal.fire({
            title: "產品刪除成功",
            icon: "success",
          });
          getProductsData();
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: error.response.data.message,
          });
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  // 首次進入頁面執行
  useEffect(() => {
    const token = document.cookie.replace(
      /(?:(?:^|.*;\s*)hexToken\s*=\s*([^;]*).*$)|^.*$/,
      "$1"
    );

    if (token) {
      loginCheck(token);
    } else {
      Swal.fire({
        icon: "warning",
        title: "未登入",
        text: "請先登入以檢視產品資料。",
      });
    }

    // modal
    myModal.current = new bootstrap.Modal(productModalRef.current);
  }, []);

  return (
    <>
      <Loading isLoading={isLoading} />
      {isAuth ? (
        <div className="container">
          <div className="text-end mt-4">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => openModal(temProduct, "add")}
            >
              建立新的產品
            </button>
          </div>
          <table className="table mt-4">
            <thead>
              <tr>
                <th width="120">分類</th>
                <th>產品名稱</th>
                <th width="120" className="text-end">
                  原價
                </th>
                <th width="120" className="text-end">
                  售價
                </th>
                <th width="100">是否啟用</th>
                <th width="120">編輯</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(products).length > 0 ? (
                Object.values(products).map((item) => (
                  <tr key={item.id}>
                    <td>{item.category}</td>
                    <td>{item.title}</td>
                    <td className="text-end">
                      <del>{item.origin_price}</del>
                    </td>
                    <td className="text-end">{item.price}</td>
                    <td>
                      {item.is_enabled === 1 ? (
                        <span className="text-success">啟用</span>
                      ) : (
                        <span>未啟用</span>
                      )}
                    </td>
                    <td>
                      <div className="btn-group">
                        <button
                          type="button"
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => openModal(item, "edit")}
                        >
                          編輯
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => deleteProductsData(item.id)}
                        >
                          刪除
                        </button>
                      </div>
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
      <div
        id="productModal"
        className="modal fade"
        tabIndex="-1"
        aria-labelledby="productModalLabel"
        aria-hidden="true"
        ref={productModalRef}
      >
        <div className="modal-dialog modal-xl">
          <div className="modal-content border-0">
            <div className="modal-header bg-dark text-white">
              <h5 id="productModalLabel" className="modal-title">
                {modalType === "add" ? (
                  <span>新增產品</span>
                ) : (
                  <span>編輯產品</span>
                )}
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <div className="row">
                <div className="col-sm-4">
                  <div className="mb-2">
                    <div className="mb-3">
                      <label htmlFor="imageUrl" className="form-label">
                        輸入圖片網址
                      </label>
                      <input
                        id="imageUrl"
                        type="text"
                        className="form-control mb-3"
                        placeholder="請輸入主圖連結"
                        value={temProduct.imageUrl}
                        onChange={handleProductInputChange}
                      />
                      {temProduct.imagesUrl.map((item, index) => (
                        <div className="mb-3" key={index}>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="請輸入副圖連結"
                            value={item}
                            onChange={(e) =>
                              handleImageChange(e.target.value, index)
                            }
                          />
                        </div>
                      ))}
                    </div>
                    <img className="img-fluid" src="" alt="" />
                  </div>
                  <div>
                    {temProduct.imagesUrl.length < 5 &&
                      temProduct.imagesUrl[temProduct.imagesUrl.length - 1] !==
                        "" && (
                        <button
                          className="btn btn-outline-primary btn-sm w-100"
                          onClick={handleAddImg}
                        >
                          新增圖片
                        </button>
                      )}

                    {temProduct.imagesUrl.length >= 1 && (
                      <button
                        className="btn btn-outline-danger btn-sm w-100"
                        onClick={handleRemoveImg}
                      >
                        取消圖片
                      </button>
                    )}
                  </div>
                </div>
                <div className="col-sm-8">
                  <div className="mb-3 text-start">
                    <label htmlFor="title" className="form-label">
                      標題
                    </label>
                    <input
                      id="title"
                      type="text"
                      className="form-control"
                      placeholder="請輸入標題"
                      value={temProduct.title}
                      onChange={handleProductInputChange}
                    />
                  </div>

                  <div className="mb-3 text-start">
                    <label htmlFor="feature" className="form-label">
                      特色標語
                    </label>
                    <input
                      id="feature"
                      type="text"
                      className="form-control"
                      placeholder="請輸入特色標語"
                      value={temProduct.feature}
                      onChange={handleProductInputChange}
                    />
                  </div>

                  <div className="row">
                    <div className="mb-3 col-md-6 text-start">
                      <label htmlFor="nation" className="form-label">
                        地區
                      </label>
                      <input
                        id="nation"
                        type="text"
                        className="form-control"
                        placeholder="請輸入地區"
                        value={temProduct.nation}
                        onChange={handleProductInputChange}
                      />
                    </div>
                    <div className="mb-3 col-md-6 text-start">
                      <label htmlFor="area" className="form-label">
                        縣市
                      </label>
                      <input
                        id="area"
                        type="text"
                        className="form-control"
                        placeholder="請輸入縣市"
                        value={temProduct.area}
                        onChange={handleProductInputChange}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="mb-3 col-md-6 text-start">
                      <label htmlFor="address" className="form-label">
                        地址
                      </label>
                      <input
                        id="address"
                        type="text"
                        className="form-control"
                        placeholder="請輸入地址"
                        value={temProduct.address}
                        onChange={handleProductInputChange}
                      />
                    </div>
                    <div className="mb-3 col-md-6 text-start">
                      <label htmlFor="addressEmbedCode" className="form-label">
                        地址嵌入碼
                      </label>
                      <input
                        id="addressEmbedCode"
                        type="text"
                        className="form-control"
                        placeholder="請輸入地址嵌入碼"
                        value={temProduct.addressEmbedCode}
                        onChange={handleProductInputChange}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="mb-3 col-md-6 text-start">
                      <label htmlFor="category" className="form-label">
                        分類
                      </label>
                      <input
                        id="category"
                        type="text"
                        className="form-control"
                        placeholder="請輸入分類"
                        value={temProduct.category}
                        onChange={handleProductInputChange}
                      />
                    </div>
                    <div className="mb-3 col-md-6 text-start">
                      <label htmlFor="unit" className="form-label">
                        單位
                      </label>
                      <input
                        id="unit"
                        type="text"
                        className="form-control"
                        placeholder="請輸入單位"
                        value={temProduct.unit}
                        onChange={handleProductInputChange}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="mb-3 col-md-6 text-start">
                      <label htmlFor="origin_price" className="form-label">
                        原價
                      </label>
                      <input
                        id="origin_price"
                        type="number"
                        min="0"
                        className="form-control"
                        placeholder="請輸入原價"
                        value={temProduct.origin_price}
                        onChange={handleProductInputChange}
                      />
                    </div>
                    <div className="mb-3 col-md-6 text-start">
                      <label htmlFor="price" className="form-label">
                        售價
                      </label>
                      <input
                        id="price"
                        type="number"
                        min="0"
                        className="form-control"
                        placeholder="請輸入售價"
                        value={temProduct.price}
                        onChange={handleProductInputChange}
                      />
                    </div>
                  </div>
                  <hr />

                  <div className="mb-3 text-start">
                    <label htmlFor="description" className="form-label">
                      產品描述
                    </label>
                    <textarea
                      id="description"
                      className="form-control"
                      placeholder="請輸入產品描述"
                      value={temProduct.description}
                      onChange={handleProductInputChange}
                    ></textarea>
                  </div>
                  <div className="mb-3 text-start">
                    <label htmlFor="content" className="form-label">
                      說明內容
                    </label>
                    <textarea
                      id="content"
                      className="form-control"
                      placeholder="請輸入說明內容"
                      value={temProduct.content}
                      onChange={handleProductInputChange}
                    ></textarea>
                  </div>
                  <div className="mb-3 text-start">
                    <div className="form-check">
                      <input
                        id="is_enabled"
                        className="form-check-input"
                        type="checkbox"
                        checked={temProduct.is_enabled}
                        onChange={handleProductInputChange}
                      />
                      <label className="form-check-label" htmlFor="is_enabled">
                        是否啟用
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline-secondary"
                data-bs-dismiss="modal"
                onClick={hideModal}
              >
                取消
              </button>
              {modalType === "add" ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={addProductsData}
                >
                  確認新增
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => editProductsData(temProduct.id)}
                >
                  確認修改
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
