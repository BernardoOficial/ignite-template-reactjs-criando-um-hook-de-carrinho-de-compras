import { MdDelete, MdAddCircleOutline, MdRemoveCircleOutline } from 'react-icons/md';

import { useCart } from '../../hooks/useCart';
import { formatPrice } from '../../util/format';
import { Container, ProductTable, Total } from './styles';

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  amount: number;
}

const Cart = (): JSX.Element => {
  const { cart, removeProduct, updateProductAmount } = useCart();

  const cartFormatted = cart.map(product => ({
    id: product.id,
    title: product.title,
    price: product.price,
    image: product.image,
    amount: product.amount,
    priceFormatted: formatPrice(product.price),
    subTotal: formatPrice(product.price * product.amount),
  }));

  const totalCart = cart.reduce((sumTotal, product) => {
    sumTotal += product.amount * product.price;
    return sumTotal;
  }, 0)

  const totalCartFormatted = formatPrice(totalCart);

  function handleProductIncrement(product: Product) {
    const newQuantityProduct = {
      productId: product.id,
      amount: product.amount + 1
    }

    console.log(cart);
    console.log(product.id)
    console.log(newQuantityProduct)

    updateProductAmount(newQuantityProduct);
  }

  function handleProductDecrement(product: Product) {
    const newQuantityProduct = {
      productId: product.id,
      amount: product.amount - 1
    }

    console.log(cart);
    console.log(product.id)
    console.log(newQuantityProduct)

    updateProductAmount(newQuantityProduct);
  }

  function handleRemoveProduct(productId: number) {
    console.log(cart);
    console.log(productId)
    removeProduct(productId);
  }

  return (
    <Container>
      <ProductTable>
        <thead>
          <tr>
            <th aria-label="product image" />
            <th>PRODUTO</th>
            <th>QTD</th>
            <th>SUBTOTAL</th>
            <th aria-label="delete icon" />
          </tr>
        </thead>
        <tbody>

          {cartFormatted.map((product, index) => (
            <tr data-testid="product" key={index}>
              <td>
                <img src={product.image} alt={product.title} />
              </td>
              <td>
                <strong>{product.title}</strong>
                <span>{product.priceFormatted}</span>
              </td>
              <td>
                <div>
                  <button
                    type="button"
                    data-testid="decrement-product"
                    disabled={product.amount <= 1}
                    onClick={() => handleProductDecrement(product)}
                  >
                    <MdRemoveCircleOutline size={20} />
                  </button>
                  <input
                    type="text"
                    data-testid="product-amount"
                    readOnly
                    value={product.amount}
                  />
                  <button
                    type="button"
                    data-testid="increment-product"
                    onClick={() => handleProductIncrement(product)}
                  >
                    <MdAddCircleOutline size={20} />
                  </button>
                </div>
              </td>
              <td>
                <strong>{product.subTotal}</strong>
              </td>
              <td>
                <button
                  type="button"
                  data-testid="remove-product"
                  onClick={() => handleRemoveProduct(product.id)}
                >
                  <MdDelete size={20} />
                </button>
              </td>
            </tr>
          ))}
          
        </tbody>
      </ProductTable>

      <footer>
        <button type="button">Finalizar pedido</button>

        <Total>
          <span>TOTAL</span>
          <strong>{totalCartFormatted}</strong>
        </Total>
      </footer>
    </Container>
  );
};

export default Cart;
