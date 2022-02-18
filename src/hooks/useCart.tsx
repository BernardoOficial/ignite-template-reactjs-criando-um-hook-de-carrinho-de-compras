import { createContext, ErrorInfo, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {

  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem("@RocketShoes:cart");
    if(storagedCart) { return JSON.parse(storagedCart) }
    return [];
  });

  const addProduct = async (productId: number) => {
    try {

      const cartProducts = [...cart];
      const isProductExist = cartProducts.find(product => product.id === productId);

      const newQuantityProduct = isProductExist ? isProductExist.amount + 1 : 1;

      const responseStock = await api.get<Stock>("http://localhost:3333/stock/" + productId);
      const stock = responseStock.data;

      if(stock.amount <= 0) {
        toast.error('Sem estoque para o produto');
        return;
      }

      if(isProductExist)  {
        const currentQuantity = isProductExist.amount;

        if(currentQuantity + 1 > stock.amount) {
          toast.error('Quantidade solicitada fora de estoque');
          return;
        }

        isProductExist.amount = newQuantityProduct;
      }
      
      else {

        const responseProduct = await api.get<Product>("http://localhost:3333/products/" + productId);
        const product = responseProduct.data;
        console.log(product);

        if(Object.keys(product).length === 0) { return }

        product.amount = 1;
        cartProducts.push(product);
      }

      console.log(cartProducts)

      setCart(cartProducts);
      localStorage.setItem("@RocketShoes:cart", JSON.stringify(cartProducts));
      toast.success('Produto adicionado ao carrinho');

    } catch(error) {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const cartProducts = [...cart];
      const isProductExist = cartProducts.findIndex(product => product.id === productId);

      if(isProductExist >= 0) {
        cartProducts.splice(isProductExist, 1);
        setCart(cartProducts);
        localStorage.setItem("@RocketShoes:cart", JSON.stringify(cartProducts));
        toast.success('Produto removido do carrinho');
      }
      else {
        throw Error();
      }

    } catch(error) {
        toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({ productId, amount }: UpdateProductAmount) => {
    try {

      if(amount < 1) { return }

      const responseStock = await api.get<Stock>("http://localhost:3333/stock/" + productId);
      const stock = responseStock.data;

      const newQuantity = amount;
      if(newQuantity > stock.amount) {
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }

      const cartProducts = [...cart];
      const isProductExist = cartProducts.findIndex(product => product.id === productId);

      if(isProductExist >= 0) {
        cartProducts[isProductExist].amount = amount;
        setCart(cartProducts);
        localStorage.setItem("@RocketShoes:cart", JSON.stringify(cartProducts));
        toast.success('Produto alterado a quantidade');
      }

    } catch(error) {
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
