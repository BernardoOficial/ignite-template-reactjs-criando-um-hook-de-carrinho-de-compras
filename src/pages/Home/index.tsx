import { useState, useEffect } from 'react';
import { MdAddShoppingCart } from 'react-icons/md';

import { ProductList } from './styles';
import { api } from '../../services/api';
import { formatPrice } from '../../util/format';
import { useCart } from '../../hooks/useCart';

interface Product {
	id: number;
	title: string;
	price: number;
	image: string;
}

interface ProductFormatted extends Product {
	priceFormatted: string;
}

interface CartItemsAmount {
	[key: number]: number;
}

const Home = (): JSX.Element => {
	const [products, setProducts] = useState<ProductFormatted[]>([]);
	const { addProduct, cart } = useCart();

	const cartItemsAmount = cart.reduce((sumAmount, product) => {
		sumAmount[product.id] = product.amount || 0;
		return sumAmount;
	}, {} as CartItemsAmount)

	useEffect(() => {
		async function loadProducts() {
			const response = await api.get("http://localhost:3333/products");
			setProducts(response.data);
		}

		loadProducts();
	}, []);

	async function handleAddProduct(productId: number) {
		await addProduct(productId);
	}

	function ProductsItems() {
		return (
			<>
				{products.map(product => (
					<li key={product.id}>

						<img src={product.image} alt={product.title} title={product.title} />

						<strong>{product.title}</strong>

						<span>{formatPrice(product.price)}</span>

						<button
							type="button"
							data-testid="add-product-button"
							onClick={() => handleAddProduct(product.id)}
						>
							<div data-testid="cart-product-quantity">
								<MdAddShoppingCart size={16} color="#ffffff" />
								{cartItemsAmount[product.id] || 0}
							</div>

							<span>ADICIONAR AO CARRINHO</span>
						</button>
					</li>
				))}
			</>
		)
	}

	return (
		<ProductList>
			<ProductsItems />
		</ProductList>
	);
};

export default Home;
