import { createContext, ReactNode, useContext, useState } from 'react';
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
      const responseStock = await api.get<Stock>("http://localhost:3333/stock/" + productId);
      const stock = responseStock.data;

      const responseProduct = await api.get("http://localhost:3333/products/" + productId);
      const product = responseProduct.data;
    
      const cartProducts = [...cart];
      const isProductExist = cartProducts.findIndex(product => product.id === productId);

      if(isProductExist === -1) {
        if(1 > stock.amount) {
          toast.error('Quantidade solicitada fora de estoque');
          return;
        }
        product.amount = 1;
        cartProducts.push(product);
        setCart(currentCart => [...currentCart, product]);
        localStorage.setItem("@RocketShoes:cart", JSON.stringify(cartProducts));
        toast.success('Produto '+ product.title +' adicionado ao carrinho');
      }
      else {
        const currentQuantity = cartProducts[isProductExist].amount;
        if(currentQuantity + 1 > stock.amount) {
          toast.error('Quantidade solicitada fora de estoque');
          return;
        }
        cartProducts[isProductExist].amount += 1;
        setCart(cartProducts);
        localStorage.setItem("@RocketShoes:cart", JSON.stringify(cartProducts));
        toast.success('Produto '+ cartProducts[isProductExist].title +' adicionado ao carrinho');
      }

    } catch(error) {
      toast.error('Erro na adição do produto');
      console.log(error);
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const cartProducts = [...cart];
      const isProductExist = cartProducts.findIndex(product => product.id === productId);

      if(isProductExist !== -1) {
        const productTitle = cartProducts[isProductExist].title;
        cartProducts.splice(isProductExist, 1);
        setCart(cartProducts);
        localStorage.setItem("@RocketShoes:cart", JSON.stringify(cartProducts));
        toast.success('Produto '+ productTitle +' removido do carrinho');
      }

    } catch(error) {
      toast.error('Erro na remoção do produto');
      console.log(error);
    }
  };

  const updateProductAmount = async ({ productId, amount }: UpdateProductAmount) => {
    try {
      const responseStock = await api.get<Stock>("http://localhost:3333/stock/" + productId);
      const stock = responseStock.data;

      const cartProducts = [...cart];
      const isProductExist = cartProducts.findIndex(product => product.id === productId);

      if(isProductExist !== -1) {
        const newQuantity = amount;
        if(newQuantity > stock.amount) {
          toast.error('Quantidade solicitada fora de estoque');
          return;
        }
        cartProducts[isProductExist].amount = amount;
        setCart(cartProducts);
        localStorage.setItem("@RocketShoes:cart", JSON.stringify(cartProducts));
        toast.success('Produto '+ cartProducts[isProductExist].title +' alterado a quantidade');
      }

    } catch(error) {
      toast.error('Erro ao alterar a quantidade do produto');
      console.log(error);
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
