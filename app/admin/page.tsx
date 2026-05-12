"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Product = {
  id: string;
  name: string;
  description: string | null;
  delivery_content: string | null;
  price: number;
  old_price: number | null;
  image_url: string | null;
  category: string | null;
  service: string | null;
  stock: number | null;
};

type Order = {
  id: string;
  order_code: string;
  customer_name: string;
  user_email: string;
  total: number;
  status: string;
  payment_method: string;
  created_at: string;
};

type ProductOption = {
  id: string;
  product_id: string;
  name: string;
  price: number;
  old_price: number | null;
};

type DashboardSettings = {
  id: string;
  revenue_override: number | null;
  orders_override: number | null;
  pending_override: number | null;
  products_override: number | null;
  updated_at: string | null;
};

type Coupon = {
  id: string;
  code: string;
  discount_type: "percent" | "fixed";
  discount_value: number;
  active: boolean;
  created_at: string;
};

type Banner = {
  id: string;
  title: string;
  subtitle: string;
  description: string | null;
  icon: string | null;
  color_from: string | null;
  color_to: string | null;
  link_url: string | null;
  active: boolean;
  position: number | null;
  created_at: string;
};

const categoryOptions = [
  "steam",
  "keys",
  "contas",
  "games",
  "gift card",
  "netflix",
  "spotify",
  "discord",
  "instagram",
  "tiktok",
  "youtube",
  "outros",
];

function moneyToNumber(value: string) {
  return Number(value.replace(",", "."));
}

function optionalNumber(value: string) {
  if (!value.trim()) return null;
  return moneyToNumber(value);
}

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
  const [dashboardSettings, setDashboardSettings] =
    useState<DashboardSettings | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [service, setService] = useState("Steam");
  const [stock, setStock] = useState("100");
  const [imageUrl, setImageUrl] = useState("");
  const [category, setCategory] = useState("steam");
  const [description, setDescription] = useState("");
  const [deliveryContent, setDeliveryContent] = useState("");

  const [selectedProductId, setSelectedProductId] = useState("");
  const [optionName, setOptionName] = useState("");
  const [optionPrice, setOptionPrice] = useState("");
  const [optionOldPrice, setOptionOldPrice] = useState("");

  const [editingOption, setEditingOption] = useState<ProductOption | null>(null);
  const [editOptionName, setEditOptionName] = useState("");
  const [editOptionPrice, setEditOptionPrice] = useState("");
  const [editOptionOldPrice, setEditOptionOldPrice] = useState("");

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editOldPrice, setEditOldPrice] = useState("");
  const [editService, setEditService] = useState("");
  const [editStock, setEditStock] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editCategory, setEditCategory] = useState("steam");
  const [editDescription, setEditDescription] = useState("");
  const [editDeliveryContent, setEditDeliveryContent] = useState("");

  const [manualRevenue, setManualRevenue] = useState("");
  const [manualOrders, setManualOrders] = useState("");
  const [manualPending, setManualPending] = useState("");
  const [manualProducts, setManualProducts] = useState("");

  const [couponCode, setCouponCode] = useState("");
  const [couponType, setCouponType] = useState<"percent" | "fixed">("percent");
  const [couponValue, setCouponValue] = useState("");
  const [couponActive, setCouponActive] = useState(true);

  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerSubtitle, setBannerSubtitle] = useState("");
  const [bannerDescription, setBannerDescription] = useState("");
  const [bannerIcon, setBannerIcon] = useState("🔥");
  const [bannerColorFrom, setBannerColorFrom] = useState("purple");
  const [bannerColorTo, setBannerColorTo] = useState("pink");
  const [bannerLinkUrl, setBannerLinkUrl] = useState("#produtos");
  const [bannerPosition, setBannerPosition] = useState("1");
  const [bannerActive, setBannerActive] = useState(true);

  const paidOrders = orders.filter(
    (o) => o.status === "pago" || o.status === "entregue"
  );

  const pendingOrders = orders.filter((o) => o.status === "pendente");

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  const selectedProductOptions = productOptions.filter(
    (option) => option.product_id === selectedProductId
  );

  const displayRevenue =
    manualRevenue.trim() !== "" ? moneyToNumber(manualRevenue) : totalRevenue;

  const displayOrders =
    manualOrders.trim() !== "" ? Number(manualOrders) : orders.length;

  const displayPending =
    manualPending.trim() !== "" ? Number(manualPending) : pendingOrders.length;

  const displayProducts =
    manualProducts.trim() !== "" ? Number(manualProducts) : products.length;

  useEffect(() => {
    async function checkAdmin() {
      const { data } = await supabase.auth.getUser();

      if (data.user?.email !== "blakkings11@gmail.com") {
        window.location.href = "/";
      }
    }

    checkAdmin();
    loadProducts();
    loadOrders();
    loadProductOptions();
    loadDashboardSettings();
    loadCoupons();
    loadBanners();

    const interval = setInterval(() => {
      loadProducts();
      loadOrders();
      loadProductOptions();
      loadDashboardSettings(false);
      loadCoupons();
      loadBanners();
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  async function loadProducts() {
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    setProducts((data as Product[]) || []);
  }

  async function loadOrders() {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    const list = (data as Order[]) || [];
    setOrders(list);

    const total = list.reduce((acc, order) => {
      if (order.status === "pago" || order.status === "entregue") {
        return acc + Number(order.total);
      }
      return acc;
    }, 0);

    setTotalRevenue(total);
  }

  async function loadProductOptions() {
    const { data, error } = await supabase
      .from("product_options")
      .select("*")
      .order("price", { ascending: true });

    if (error) {
      console.log(error);
      return;
    }

    setProductOptions((data as ProductOption[]) || []);
  }

  async function loadDashboardSettings(syncInputs = true) {
    const { data, error } = await supabase
      .from("dashboard_settings")
      .select("*")
      .limit(1)
      .single();

    if (error) {
      console.log(error);
      return;
    }

    const settings = data as DashboardSettings;
    setDashboardSettings(settings);

    if (syncInputs) {
      setManualRevenue(
        settings.revenue_override !== null
          ? String(settings.revenue_override)
          : ""
      );
      setManualOrders(
        settings.orders_override !== null ? String(settings.orders_override) : ""
      );
      setManualPending(
        settings.pending_override !== null
          ? String(settings.pending_override)
          : ""
      );
      setManualProducts(
        settings.products_override !== null
          ? String(settings.products_override)
          : ""
      );
    }
  }


  async function loadCoupons() {
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    setCoupons((data as Coupon[]) || []);
  }

  async function addCoupon() {
    if (!couponCode.trim()) {
      alert("Digite o código do cupom");
      return;
    }

    if (!couponValue.trim() || isNaN(moneyToNumber(couponValue))) {
      alert("Digite um valor de desconto válido");
      return;
    }

    const value = moneyToNumber(couponValue);

    if (couponType === "percent" && (value <= 0 || value > 100)) {
      alert("Desconto em porcentagem precisa ser entre 1 e 100");
      return;
    }

    if (couponType === "fixed" && value <= 0) {
      alert("Desconto fixo precisa ser maior que zero");
      return;
    }

    const { error } = await supabase.from("coupons").insert({
      code: couponCode.trim().toUpperCase(),
      discount_type: couponType,
      discount_value: value,
      active: couponActive,
    });

    if (error) {
      alert("Erro ao criar cupom: " + error.message);
      return;
    }

    alert("Cupom criado!");
    setCouponCode("");
    setCouponValue("");
    setCouponType("percent");
    setCouponActive(true);
    loadCoupons();
  }

  async function toggleCoupon(coupon: Coupon) {
    const { error } = await supabase
      .from("coupons")
      .update({ active: !coupon.active })
      .eq("id", coupon.id);

    if (error) {
      alert("Erro ao alterar cupom: " + error.message);
      return;
    }

    loadCoupons();
  }

  async function deleteCoupon(id: string) {
    const confirmar = confirm("Tem certeza que deseja apagar este cupom?");
    if (!confirmar) return;

    const { error } = await supabase.from("coupons").delete().eq("id", id);

    if (error) {
      alert("Erro ao apagar cupom: " + error.message);
      return;
    }

    loadCoupons();
  }


  async function loadBanners() {
    const { data, error } = await supabase
      .from("promo_banners")
      .select("*")
      .order("position", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    setBanners((data as Banner[]) || []);
  }

  async function addBanner() {
    if (!bannerTitle.trim() || !bannerSubtitle.trim()) {
      alert("Preencha título e subtítulo do banner");
      return;
    }

    const { error } = await supabase.from("promo_banners").insert({
      title: bannerTitle.trim(),
      subtitle: bannerSubtitle.trim(),
      description: bannerDescription.trim() || null,
      icon: bannerIcon.trim() || "🔥",
      color_from: bannerColorFrom,
      color_to: bannerColorTo,
      link_url: bannerLinkUrl.trim() || "#produtos",
      active: bannerActive,
      position: bannerPosition.trim() ? Number(bannerPosition) : 1,
    });

    if (error) {
      alert("Erro ao criar banner: " + error.message);
      return;
    }

    alert("Banner criado!");
    setBannerTitle("");
    setBannerSubtitle("");
    setBannerDescription("");
    setBannerIcon("🔥");
    setBannerColorFrom("purple");
    setBannerColorTo("pink");
    setBannerLinkUrl("#produtos");
    setBannerPosition("1");
    setBannerActive(true);
    loadBanners();
  }

  async function toggleBanner(banner: Banner) {
    const { error } = await supabase
      .from("promo_banners")
      .update({ active: !banner.active })
      .eq("id", banner.id);

    if (error) {
      alert("Erro ao alterar banner: " + error.message);
      return;
    }

    loadBanners();
  }

  async function deleteBanner(id: string) {
    const confirmar = confirm("Tem certeza que deseja apagar este banner?");
    if (!confirmar) return;

    const { error } = await supabase
      .from("promo_banners")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Erro ao apagar banner: " + error.message);
      return;
    }

    loadBanners();
  }

  async function saveDashboardSettings() {
    if (
      manualRevenue.trim() !== "" &&
      isNaN(optionalNumber(manualRevenue) as number)
    ) {
      alert("Faturamento manual inválido");
      return;
    }

    if (manualOrders.trim() !== "" && isNaN(Number(manualOrders))) {
      alert("Pedidos manual inválido");
      return;
    }

    if (manualPending.trim() !== "" && isNaN(Number(manualPending))) {
      alert("Pendentes manual inválido");
      return;
    }

    if (manualProducts.trim() !== "" && isNaN(Number(manualProducts))) {
      alert("Produtos manual inválido");
      return;
    }

    const payload = {
      revenue_override: optionalNumber(manualRevenue),
      orders_override: manualOrders.trim() ? Number(manualOrders) : null,
      pending_override: manualPending.trim() ? Number(manualPending) : null,
      products_override: manualProducts.trim() ? Number(manualProducts) : null,
      updated_at: new Date().toISOString(),
    };

    if (dashboardSettings?.id) {
      const { error } = await supabase
        .from("dashboard_settings")
        .update(payload)
        .eq("id", dashboardSettings.id);

      if (error) {
        alert("Erro ao salvar dashboard: " + error.message);
        return;
      }
    } else {
      const { error } = await supabase
        .from("dashboard_settings")
        .insert(payload);

      if (error) {
        alert("Erro ao criar dashboard: " + error.message);
        return;
      }
    }

    alert("Dashboard atualizado!");
    loadDashboardSettings();
  }

  function clearDashboardSettings() {
    setManualRevenue("");
    setManualOrders("");
    setManualPending("");
    setManualProducts("");
  }

  async function addProduct() {
    if (!name || !price) {
      alert("Preencha nome e preço");
      return;
    }

    if (isNaN(moneyToNumber(price))) {
      alert("Preço inválido");
      return;
    }

    const { error } = await supabase.from("products").insert({
      name,
      price: moneyToNumber(price),
      old_price: oldPrice ? moneyToNumber(oldPrice) : null,
      service,
      stock: Number(stock),
      image_url: imageUrl,
      category: category.toLowerCase(),
      description,
      delivery_content: deliveryContent,
    });

    if (error) {
      alert("Erro: " + error.message);
      return;
    }

    alert("Produto adicionado!");

    setName("");
    setPrice("");
    setOldPrice("");
    setImageUrl("");
    setCategory("steam");
    setDescription("");
    setDeliveryContent("");

    loadProducts();
  }

  function startEditProduct(product: Product) {
    setEditingProduct(product);
    setEditName(product.name || "");
    setEditPrice(String(product.price || ""));
    setEditOldPrice(product.old_price ? String(product.old_price) : "");
    setEditService(product.service || "Steam");
    setEditStock(String(product.stock || "100"));
    setEditImageUrl(product.image_url || "");
    setEditCategory(product.category || "steam");
    setEditDescription(product.description || "");
    setEditDeliveryContent(product.delivery_content || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEditProduct() {
    setEditingProduct(null);
    setEditName("");
    setEditPrice("");
    setEditOldPrice("");
    setEditService("");
    setEditStock("");
    setEditImageUrl("");
    setEditCategory("steam");
    setEditDescription("");
    setEditDeliveryContent("");
  }

  async function updateProduct() {
    if (!editingProduct) {
      alert("Nenhum produto selecionado para editar.");
      return;
    }

    const produtoId = String(editingProduct.id).trim();

    if (!produtoId) {
      alert("Erro: ID do produto não encontrado.");
      return;
    }

    if (!editName.trim() || !editPrice.trim()) {
      alert("Preencha nome e preço");
      return;
    }

    const novoPreco = moneyToNumber(editPrice);
    const novoPrecoAntigo = editOldPrice.trim() ? moneyToNumber(editOldPrice) : null;
    const novoEstoque = editStock.trim() ? Number(editStock) : 0;

    if (isNaN(novoPreco)) {
      alert("Preço inválido");
      return;
    }

    if (novoPrecoAntigo !== null && isNaN(novoPrecoAntigo)) {
      alert("Preço antigo inválido");
      return;
    }

    if (isNaN(novoEstoque)) {
      alert("Estoque inválido");
      return;
    }

    const payload = {
      name: editName.trim(),
      price: novoPreco,
      old_price: novoPrecoAntigo,
      service: editService.trim(),
      stock: novoEstoque,
      image_url: editImageUrl.trim() || null,
      category: editCategory.trim().toLowerCase(),
      description: editDescription.trim() || null,
      delivery_content: editDeliveryContent.trim() || null,
    };

    const { data, error } = await supabase
      .from("products")
      .update(payload)
      .eq("id", produtoId)
      .select()
      .single();

    if (error) {
      alert("Erro ao atualizar produto: " + error.message);
      console.error("Erro updateProduct:", error);
      return;
    }

    if (!data) {
      alert("Nenhum produto foi atualizado. Confira se o ID existe no Supabase.");
      return;
    }

    alert("Produto atualizado com sucesso!");

    setProducts((currentProducts) =>
      currentProducts.map((product) =>
        product.id === produtoId ? (data as Product) : product
      )
    );

    cancelEditProduct();
    await loadProducts();
  }

  async function deleteProduct(id: string) {
    const confirmar = confirm("Tem certeza que deseja apagar este produto?");
    if (!confirmar) return;

    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      alert("Erro ao apagar: " + error.message);
      return;
    }

    alert("Produto apagado!");
    loadProducts();
    loadProductOptions();
  }

  async function uploadImage(file: File, mode: "create" | "edit" = "create") {
    const cleanName = file.name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9.-]/g, "-")
      .toLowerCase();

    const fileName = Date.now() + "-" + cleanName;

    const { error } = await supabase.storage
      .from("products")
      .upload(fileName, file);

    if (error) {
      alert("Erro upload: " + error.message);
      return;
    }

    const { data } = supabase.storage.from("products").getPublicUrl(fileName);

    if (mode === "edit") {
      setEditImageUrl(data.publicUrl);
    } else {
      setImageUrl(data.publicUrl);
    }
  }

  async function addProductOption() {
    if (!selectedProductId) {
      alert("Selecione um produto");
      return;
    }

    if (!optionName || !optionPrice) {
      alert("Preencha nome da opção e preço");
      return;
    }

    if (isNaN(moneyToNumber(optionPrice))) {
      alert("Preço da opção inválido");
      return;
    }

    const { error } = await supabase.from("product_options").insert({
      product_id: selectedProductId,
      name: optionName,
      price: moneyToNumber(optionPrice),
      old_price: optionOldPrice ? moneyToNumber(optionOldPrice) : null,
    });

    if (error) {
      alert("Erro ao criar opção: " + error.message);
      return;
    }

    alert("Opção adicionada!");

    setOptionName("");
    setOptionPrice("");
    setOptionOldPrice("");

    loadProductOptions();
  }

  function startEditOption(option: ProductOption) {
    setEditingOption(option);
    setEditOptionName(option.name || "");
    setEditOptionPrice(String(option.price || ""));
    setEditOptionOldPrice(option.old_price ? String(option.old_price) : "");
  }

  function cancelEditOption() {
    setEditingOption(null);
    setEditOptionName("");
    setEditOptionPrice("");
    setEditOptionOldPrice("");
  }

  async function updateProductOption() {
    if (!editingOption) return;

    if (!editOptionName || !editOptionPrice) {
      alert("Preencha nome e preço da opção");
      return;
    }

    if (isNaN(moneyToNumber(editOptionPrice))) {
      alert("Preço da opção inválido");
      return;
    }

    const { error } = await supabase
      .from("product_options")
      .update({
        name: editOptionName,
        price: moneyToNumber(editOptionPrice),
        old_price: editOptionOldPrice ? moneyToNumber(editOptionOldPrice) : null,
      })
      .eq("id", editingOption.id);

    if (error) {
      alert("Erro ao atualizar opção: " + error.message);
      return;
    }

    alert("Opção atualizada!");
    cancelEditOption();
    loadProductOptions();
  }

  async function deleteProductOption(id: string) {
    const confirmar = confirm("Tem certeza que deseja apagar esta opção?");
    if (!confirmar) return;

    const { error } = await supabase
      .from("product_options")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Erro ao apagar opção: " + error.message);
      return;
    }

    alert("Opção apagada!");
    loadProductOptions();
  }

  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_12%_10%,rgba(168,85,247,0.30),transparent_32%),radial-gradient(circle_at_88%_18%,rgba(236,72,153,0.20),transparent_30%),radial-gradient(circle_at_50%_100%,rgba(59,130,246,0.13),transparent_38%)]"></div>
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:54px_54px]"></div>
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-pink-500 to-violet-500 shadow-[0_0_25px_rgba(168,85,247,0.9)] z-[999]"></div>
      <header className="h-24 border-b border-purple-500/30 flex items-center justify-between px-8 bg-black/80 backdrop-blur-2xl sticky top-0 z-50 shadow-[0_0_35px_rgba(168,85,247,0.15)] relative">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 via-pink-500 to-violet-500 flex items-center justify-center text-3xl animate-pulse shadow-[0_0_30px_rgba(168,85,247,0.65)]">⚡</div>

          <div>
            <h1 className="text-2xl font-black glitch-text">
              Painel Admin Insano
            </h1>
            <p className="text-xs text-zinc-500">
              Sistema Shopp Star em tempo real
            </p>
          </div>

          <span className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 rounded-xl text-sm font-black shadow-[0_0_25px_rgba(168,85,247,0.55)] border border-white/10">
            ADMIN
          </span>
        </div>

        <div className="flex gap-4 items-center">
          <a
            href="/admin/orders"
            className="neon-button-strong px-5 py-3 rounded-xl"
          >
            📦 Pedidos
          </a>

          <a
            href="/"
            className="border border-purple-500/30 px-5 py-3 rounded-xl hover:bg-purple-900 transition"
          >
            Ver Loja
          </a>

          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center font-black shadow-lg shadow-purple-500/40">
            A
          </div>
        </div>
      </header>

      <div className="grid grid-cols-[270px_1fr] relative z-10">
        <aside className="min-h-[calc(100vh-96px)] border-r border-purple-500/20 p-5 bg-black/55 backdrop-blur-2xl sticky top-24 h-[calc(100vh-96px)] overflow-y-auto">
          <a
            className="block p-4 rounded-2xl mb-3 bg-gradient-to-r from-purple-700 to-pink-700 font-black shadow-[0_0_25px_rgba(168,85,247,0.35)] border border-white/10"
            href="/admin"
          >
            📊 Dashboard
          </a>

          <a
            className="block p-4 rounded-2xl mb-3 hover:bg-purple-500/10 border border-transparent hover:border-purple-500/30 transition font-bold"
            href="#dashboard-config"
          >
            ⚙️ Dados
          </a>

          <a
            className="block p-4 rounded-2xl mb-3 hover:bg-purple-500/10 border border-transparent hover:border-purple-500/30 transition font-bold"
            href="#cupons"
          >
            🎟️ Cupons
          </a>

          <a
            className="block p-4 rounded-2xl mb-3 hover:bg-purple-500/10 border border-transparent hover:border-purple-500/30 transition font-bold"
            href="#banners"
          >
            🎁 Banners
          </a>

          <a
            className="block p-4 rounded-2xl mb-3 hover:bg-purple-500/10 border border-transparent hover:border-purple-500/30 transition font-bold"
            href="#novo-produto"
          >
            ➕ Produto
          </a>

          <a
            className="block p-4 rounded-2xl mb-3 hover:bg-purple-500/10 border border-transparent hover:border-purple-500/30 transition font-bold"
            href="#editar-produto"
          >
            ✏️ Editar Produto
          </a>

          <a
            className="block p-4 rounded-2xl mb-3 hover:bg-purple-500/10 border border-transparent hover:border-purple-500/30 transition font-bold"
            href="#opcoes-produto"
          >
            🧩 Opções
          </a>

          <a
            className="block p-4 rounded-2xl mb-3 hover:bg-purple-500/10 border border-transparent hover:border-purple-500/30 transition font-bold"
            href="/admin/orders"
          >
            📦 Pedidos
          </a>

          <a
            className="block p-4 rounded-2xl mb-3 hover:bg-purple-500/10 border border-transparent hover:border-purple-500/30 transition font-bold"
            href="/orders"
          >
            👤 Área Cliente
          </a>

          <a
            className="block p-4 rounded-2xl mb-3 hover:bg-purple-500/10 border border-transparent hover:border-purple-500/30 transition font-bold"
            href="/"
          >
            🏪 Ver Loja
          </a>
        </aside>

        <section className="p-8 relative z-10">
          <div className="neon-card rounded-[2rem] p-10 mb-8 relative overflow-hidden border border-purple-500/20 shadow-[0_0_50px_rgba(168,85,247,0.18)]">
            <div className="absolute -top-20 right-0 w-96 h-96 bg-purple-600/20 blur-3xl rounded-full"></div>
            <div className="absolute -bottom-20 left-0 w-96 h-96 bg-pink-600/10 blur-3xl rounded-full"></div>

            <div className="relative z-10">
              <p className="text-purple-300 font-black mb-2 tracking-[0.35em] text-sm">
                CENTRAL DE COMANDO PREMIUM
              </p>

              <h2 className="text-6xl font-black glitch-text mb-4">
                Bem-vindo ao painel
              </h2>

              <p className="text-zinc-400">
                Acompanhe vendas, pedidos, produtos, opções e entregas em tempo
                real.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="md:col-span-4 grid lg:grid-cols-3 gap-6 mb-2">
              <div className="neon-card rounded-3xl p-6 border border-green-500/20 relative overflow-hidden">
                <div className="absolute -top-16 -right-16 w-48 h-48 bg-green-500/10 blur-3xl rounded-full"></div>
                <p className="text-zinc-400 text-sm font-bold">Status operacional</p>
                <h3 className="text-3xl font-black text-green-400 mt-2">🟢 Loja online</h3>
                <p className="text-zinc-500 text-sm mt-2">Sistema funcionando em tempo real</p>
              </div>

              <div className="neon-card rounded-3xl p-6 border border-purple-500/20 relative overflow-hidden">
                <div className="absolute -top-16 -right-16 w-48 h-48 bg-purple-500/10 blur-3xl rounded-full"></div>
                <p className="text-zinc-400 text-sm font-bold">Performance</p>
                <h3 className="text-3xl font-black text-purple-300 mt-2">⚡ Alta conversão</h3>
                <p className="text-zinc-500 text-sm mt-2">Produtos, opções e pedidos ativos</p>
              </div>

              <div className="neon-card rounded-3xl p-6 border border-pink-500/20 relative overflow-hidden">
                <div className="absolute -top-16 -right-16 w-48 h-48 bg-pink-500/10 blur-3xl rounded-full"></div>
                <p className="text-zinc-400 text-sm font-bold">Admin center</p>
                <h3 className="text-3xl font-black text-pink-300 mt-2">📊 Controle total</h3>
                <p className="text-zinc-500 text-sm mt-2">Gerencie loja, ofertas e entregas</p>
              </div>
            </div>
            <div className="neon-card p-6 rounded-3xl hover:-translate-y-1 transition relative overflow-hidden border border-white/10 shadow-[0_0_30px_rgba(168,85,247,0.12)]">
              <p className="text-zinc-400">Faturamento</p>
              <h2 className="text-3xl font-black text-green-400">
                R$ {Number(displayRevenue).toFixed(2)}
              </h2>
              <p className="text-xs text-zinc-500 mt-2">
                {manualRevenue ? "Valor manual" : "Pedidos pagos"}
              </p>
            </div>

            <div className="neon-card p-6 rounded-3xl hover:-translate-y-1 transition relative overflow-hidden border border-white/10 shadow-[0_0_30px_rgba(168,85,247,0.12)]">
              <p className="text-zinc-400">Pedidos</p>
              <h2 className="text-3xl font-black text-purple-400">
                {displayOrders}
              </h2>
              <p className="text-xs text-zinc-500 mt-2">
                {manualOrders ? "Valor manual" : "Total criado"}
              </p>
            </div>

            <div className="neon-card p-6 rounded-3xl hover:-translate-y-1 transition relative overflow-hidden border border-white/10 shadow-[0_0_30px_rgba(168,85,247,0.12)]">
              <p className="text-zinc-400">Pendentes</p>
              <h2 className="text-3xl font-black text-yellow-400">
                {displayPending}
              </h2>
              <p className="text-xs text-zinc-500 mt-2">
                {manualPending ? "Valor manual" : "Aguardando pagamento"}
              </p>
            </div>

            <div className="neon-card p-6 rounded-3xl hover:-translate-y-1 transition relative overflow-hidden border border-white/10 shadow-[0_0_30px_rgba(168,85,247,0.12)]">
              <p className="text-zinc-400">Produtos</p>
              <h2 className="text-3xl font-black text-pink-400">
                {displayProducts}
              </h2>
              <p className="text-xs text-zinc-500 mt-2">
                {manualProducts ? "Valor manual" : "Ativos na loja"}
              </p>
            </div>
          </div>

          <div id="dashboard-config" className="neon-card rounded-3xl p-8 mb-8 border border-purple-500/20 shadow-[0_0_40px_rgba(168,85,247,0.14)]">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-black glitch-text">
                  ⚙️ Configurações do Dashboard
                </h2>
                <p className="text-zinc-400 text-sm mt-1">
                  Preencha para mostrar valor manual. Deixe vazio para usar o
                  valor automático.
                </p>
              </div>

              <button
                onClick={clearDashboardSettings}
                className="border border-yellow-500/40 text-yellow-300 px-5 py-3 rounded-xl font-bold hover:bg-yellow-600 hover:text-black transition"
              >
                Limpar campos
              </button>
            </div>

            <div className="grid md:grid-cols-4 gap-5">
              <div>
                <label className="text-sm font-bold text-zinc-400">
                  FATURAMENTO MANUAL
                </label>
                <input
                  value={manualRevenue}
                  onChange={(e) => setManualRevenue(e.target.value)}
                  placeholder="Ex: 1500.00"
                  className="input"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-zinc-400">
                  PEDIDOS MANUAL
                </label>
                <input
                  value={manualOrders}
                  onChange={(e) => setManualOrders(e.target.value)}
                  placeholder="Ex: 120"
                  className="input"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-zinc-400">
                  PENDENTES MANUAL
                </label>
                <input
                  value={manualPending}
                  onChange={(e) => setManualPending(e.target.value)}
                  placeholder="Ex: 8"
                  className="input"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-zinc-400">
                  PRODUTOS MANUAL
                </label>
                <input
                  value={manualProducts}
                  onChange={(e) => setManualProducts(e.target.value)}
                  placeholder="Ex: 32"
                  className="input"
                />
              </div>
            </div>

            <button
              onClick={saveDashboardSettings}
              className="w-full neon-button-strong py-4 rounded-xl font-bold mt-4"
            >
              💾 SALVAR DADOS DO DASHBOARD
            </button>
          </div>

          <div id="cupons" className="neon-card rounded-3xl p-8 mb-8 border border-purple-500/20 shadow-[0_0_40px_rgba(168,85,247,0.14)]">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-black glitch-text">
                  🎟️ Cupons de Desconto
                </h2>
                <p className="text-zinc-400 text-sm mt-1">
                  Crie cupons para usar no carrinho e checkout sem mexer no código.
                </p>
              </div>

              <span className="bg-black/40 px-4 py-2 rounded-xl border border-purple-500/20">
                {coupons.length} cupons
              </span>
            </div>

            <div className="grid lg:grid-cols-[1fr_1.2fr] gap-8">
              <div className="bg-black/40 border border-white/10 rounded-3xl p-6">
                <label className="text-sm font-bold text-zinc-400">
                  CÓDIGO DO CUPOM
                </label>
                <input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Ex: SHOPP10"
                  className="input"
                />

                <label className="text-sm font-bold text-zinc-400">
                  TIPO DE DESCONTO
                </label>
                <select
                  value={couponType}
                  onChange={(e) =>
                    setCouponType(e.target.value as "percent" | "fixed")
                  }
                  className="input"
                >
                  <option value="percent">Porcentagem (%)</option>
                  <option value="fixed">Valor fixo (R$)</option>
                </select>

                <label className="text-sm font-bold text-zinc-400">
                  VALOR DO DESCONTO
                </label>
                <input
                  value={couponValue}
                  onChange={(e) => setCouponValue(e.target.value)}
                  placeholder={couponType === "percent" ? "Ex: 10" : "Ex: 5.00"}
                  className="input"
                />

                <label className="flex gap-3 items-center bg-black/40 border border-white/10 rounded-2xl p-4 mb-4">
                  <input
                    type="checkbox"
                    checked={couponActive}
                    onChange={(e) => setCouponActive(e.target.checked)}
                  />
                  <span className="font-bold text-zinc-300">
                    Cupom ativo
                  </span>
                </label>

                <button
                  onClick={addCoupon}
                  className="w-full neon-button-strong py-4 rounded-xl font-bold"
                >
                  ➕ CRIAR CUPOM
                </button>
              </div>

              <div className="space-y-4 max-h-[520px] overflow-y-auto pr-2">
                {coupons.map((coupon) => (
                  <div
                    key={coupon.id}
                    className="bg-black/50 border border-white/10 rounded-3xl p-5 flex flex-wrap items-center justify-between gap-4 hover:border-purple-500/50 transition"
                  >
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-2xl font-black text-purple-300">
                          {coupon.code}
                        </h3>

                        <span
                          className={`text-xs font-black px-3 py-1 rounded-full border ${
                            coupon.active
                              ? "text-green-300 border-green-500/40 bg-green-500/10"
                              : "text-red-300 border-red-500/40 bg-red-500/10"
                          }`}
                        >
                          {coupon.active ? "ATIVO" : "INATIVO"}
                        </span>
                      </div>

                      <p className="text-zinc-400 mt-2">
                        {coupon.discount_type === "percent"
                          ? `${Number(coupon.discount_value)}% de desconto`
                          : `R$ ${Number(coupon.discount_value).toFixed(2)} de desconto`}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleCoupon(coupon)}
                        className="border border-yellow-500/40 text-yellow-300 px-4 py-3 rounded-xl font-bold hover:bg-yellow-600 hover:text-black transition"
                      >
                        {coupon.active ? "Desativar" : "Ativar"}
                      </button>

                      <button
                        onClick={() => deleteCoupon(coupon.id)}
                        className="border border-red-500/40 text-red-300 px-4 py-3 rounded-xl font-bold hover:bg-red-600 hover:text-white transition"
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                ))}

                {coupons.length === 0 && (
                  <div className="bg-black/40 border border-white/10 rounded-3xl p-8 text-center">
                    <p className="text-zinc-400">
                      Nenhum cupom criado ainda.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>


          <div id="banners" className="neon-card rounded-3xl p-8 mb-8 border border-pink-500/20 shadow-[0_0_40px_rgba(236,72,153,0.12)]">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-black glitch-text">
                  🎁 Banners Editáveis
                </h2>
                <p className="text-zinc-400 text-sm mt-1">
                  Crie banners de promoção para aparecerem na home sem mexer no código.
                </p>
              </div>

              <span className="bg-black/40 px-4 py-2 rounded-xl border border-pink-500/20">
                {banners.length} banners
              </span>
            </div>

            <div className="grid lg:grid-cols-[1fr_1.2fr] gap-8">
              <div className="bg-black/40 border border-white/10 rounded-3xl p-6">
                <label className="text-sm font-bold text-zinc-400">
                  TÍTULO
                </label>
                <input
                  value={bannerTitle}
                  onChange={(e) => setBannerTitle(e.target.value)}
                  placeholder="Ex: NETFLIX PREMIUM"
                  className="input"
                />

                <label className="text-sm font-bold text-zinc-400">
                  SUBTÍTULO
                </label>
                <input
                  value={bannerSubtitle}
                  onChange={(e) => setBannerSubtitle(e.target.value)}
                  placeholder="Ex: ATÉ 30% OFF"
                  className="input"
                />

                <label className="text-sm font-bold text-zinc-400">
                  DESCRIÇÃO
                </label>
                <input
                  value={bannerDescription}
                  onChange={(e) => setBannerDescription(e.target.value)}
                  placeholder="Ex: Entrega rápida e garantia premium"
                  className="input"
                />

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="text-sm font-bold text-zinc-400">
                      ÍCONE
                    </label>
                    <input
                      value={bannerIcon}
                      onChange={(e) => setBannerIcon(e.target.value)}
                      placeholder="🔥"
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold text-zinc-400">
                      POSIÇÃO
                    </label>
                    <input
                      value={bannerPosition}
                      onChange={(e) => setBannerPosition(e.target.value)}
                      placeholder="1"
                      className="input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="text-sm font-bold text-zinc-400">
                      COR INICIAL
                    </label>
                    <select
                      value={bannerColorFrom}
                      onChange={(e) => setBannerColorFrom(e.target.value)}
                      className="input"
                    >
                      <option value="purple">Roxo</option>
                      <option value="pink">Rosa</option>
                      <option value="red">Vermelho</option>
                      <option value="green">Verde</option>
                      <option value="blue">Azul</option>
                      <option value="yellow">Amarelo</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-bold text-zinc-400">
                      COR FINAL
                    </label>
                    <select
                      value={bannerColorTo}
                      onChange={(e) => setBannerColorTo(e.target.value)}
                      className="input"
                    >
                      <option value="pink">Rosa</option>
                      <option value="purple">Roxo</option>
                      <option value="red">Vermelho</option>
                      <option value="green">Verde</option>
                      <option value="blue">Azul</option>
                      <option value="yellow">Amarelo</option>
                    </select>
                  </div>
                </div>

                <label className="text-sm font-bold text-zinc-400">
                  LINK DO BANNER
                </label>
                <input
                  value={bannerLinkUrl}
                  onChange={(e) => setBannerLinkUrl(e.target.value)}
                  placeholder="#produtos ou /product/id"
                  className="input"
                />

                <label className="flex gap-3 items-center bg-black/40 border border-white/10 rounded-2xl p-4 mb-4">
                  <input
                    type="checkbox"
                    checked={bannerActive}
                    onChange={(e) => setBannerActive(e.target.checked)}
                  />
                  <span className="font-bold text-zinc-300">
                    Banner ativo
                  </span>
                </label>

                <button
                  onClick={addBanner}
                  className="w-full neon-button-strong py-4 rounded-xl font-bold"
                >
                  ➕ CRIAR BANNER
                </button>
              </div>

              <div className="space-y-4 max-h-[620px] overflow-y-auto pr-2">
                {banners.map((banner) => (
                  <div
                    key={banner.id}
                    className="bg-black/50 border border-white/10 rounded-3xl p-5 hover:border-pink-500/50 transition"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{banner.icon || "🔥"}</span>

                          <div>
                            <h3 className="text-2xl font-black text-pink-300">
                              {banner.title}
                            </h3>
                            <p className="text-white font-bold">
                              {banner.subtitle}
                            </p>
                          </div>
                        </div>

                        <p className="text-zinc-400 mt-3">
                          {banner.description || "Sem descrição"}
                        </p>

                        <p className="text-zinc-500 text-sm mt-2">
                          Link: {banner.link_url || "#produtos"} • Posição:{" "}
                          {banner.position || 1}
                        </p>
                      </div>

                      <span
                        className={`text-xs font-black px-3 py-1 rounded-full border ${
                          banner.active
                            ? "text-green-300 border-green-500/40 bg-green-500/10"
                            : "text-red-300 border-red-500/40 bg-red-500/10"
                        }`}
                      >
                        {banner.active ? "ATIVO" : "INATIVO"}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-5">
                      <button
                        onClick={() => toggleBanner(banner)}
                        className="border border-yellow-500/40 text-yellow-300 px-4 py-3 rounded-xl font-bold hover:bg-yellow-600 hover:text-black transition"
                      >
                        {banner.active ? "Desativar" : "Ativar"}
                      </button>

                      <button
                        onClick={() => deleteBanner(banner.id)}
                        className="border border-red-500/40 text-red-300 px-4 py-3 rounded-xl font-bold hover:bg-red-600 hover:text-white transition"
                      >
                        🗑 Apagar
                      </button>
                    </div>
                  </div>
                ))}

                {banners.length === 0 && (
                  <div className="bg-black/40 border border-white/10 rounded-3xl p-8 text-center">
                    <p className="text-zinc-400">
                      Nenhum banner criado ainda.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {editingProduct && (
            <div
              id="editar-produto"
              className="neon-card rounded-3xl p-8 mb-8 border border-pink-500/40 shadow-[0_0_45px_rgba(236,72,153,0.16)]"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-black glitch-text">
                    ✏️ Editando Produto
                  </h2>
                  <p className="text-zinc-400 text-sm mt-1">
                    Altere o anúncio já cadastrado sem criar outro.
                  </p>
                </div>

                <button
                  onClick={cancelEditProduct}
                  className="border border-red-500/40 text-red-300 px-5 py-3 rounded-xl font-bold hover:bg-red-600 hover:text-white transition"
                >
                  Cancelar
                </button>
              </div>

              <label className="text-sm font-bold text-zinc-400">
                NOME DO PRODUTO
              </label>
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="input"
              />

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="text-sm font-bold text-zinc-400">
                    PREÇO (R$)
                  </label>
                  <input
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    placeholder="Ex: 6.50 ou 6,50"
                    className="input"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-zinc-400">
                    PREÇO ANTIGO
                  </label>
                  <input
                    value={editOldPrice}
                    onChange={(e) => setEditOldPrice(e.target.value)}
                    placeholder="Ex: 25.00 ou 25,00"
                    className="input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="text-sm font-bold text-zinc-400">
                    SERVIÇO
                  </label>
                  <select
                    value={editService}
                    onChange={(e) => setEditService(e.target.value)}
                    className="input"
                  >
                    <option>Steam</option>
                    <option>Key</option>
                    <option>Conta</option>
                    <option>Gift Card</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-bold text-zinc-400">
                    ESTOQUE
                  </label>
                  <input
                    value={editStock}
                    onChange={(e) => setEditStock(e.target.value)}
                    className="input"
                  />
                </div>
              </div>

              <label className="text-sm font-bold text-zinc-400">
                TROCAR IMAGEM
              </label>
              <input
                type="file"
                accept="image/*"
                className="input"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadImage(file, "edit");
                }}
              />

              {editImageUrl && (
                <div className="bg-black/40 border border-purple-500/30 rounded-2xl p-4 mb-4">
                  <p className="text-green-400 text-sm mb-3">
                    Imagem atual/carregada ✅
                  </p>
                  <img
                    src={editImageUrl}
                    className="w-32 h-32 object-cover rounded-xl"
                  />
                </div>
              )}

              <label className="text-sm font-bold text-zinc-400">
                CATEGORIA
              </label>
              <select
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                className="input"
              >
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.toUpperCase()}
                  </option>
                ))}
              </select>

              <label className="text-sm font-bold text-zinc-400">
                DESCRIÇÃO
              </label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="input h-28"
              />

              <label className="text-sm font-bold text-zinc-400">
                CONTEÚDO DA ENTREGA
              </label>
              <textarea
                value={editDeliveryContent}
                onChange={(e) => setEditDeliveryContent(e.target.value)}
                className="input h-28"
              />

              <button
                onClick={updateProduct}
                className="w-full neon-button-strong py-4 rounded-xl font-bold mt-4"
              >
                💾 SALVAR ALTERAÇÕES DO PRODUTO
              </button>
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2 neon-card rounded-2xl p-6">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-2xl font-black glitch-text">
                  Últimos pedidos
                </h2>

                <a
                  href="/admin/orders"
                  className="text-purple-300 hover:underline font-bold"
                >
                  Ver todos →
                </a>
              </div>

              <div className="space-y-3">
                {orders.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="bg-black/40 border border-white/10 rounded-xl p-4 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-black">{order.order_code}</p>
                      <p className="text-zinc-400 text-sm">
                        {order.user_email}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-purple-300 font-black">
                        R$ {Number(order.total).toFixed(2)}
                      </p>

                      <p
                        className={`text-sm font-bold ${
                          order.status === "pago" || order.status === "entregue"
                            ? "text-green-400"
                            : "text-yellow-400"
                        }`}
                      >
                        {order.status}
                      </p>
                    </div>
                  </div>
                ))}

                {orders.length === 0 && (
                  <p className="text-zinc-400 text-center py-8">
                    Nenhum pedido ainda.
                  </p>
                )}
              </div>
            </div>

            <div className="neon-card rounded-3xl p-6 border border-purple-500/20 shadow-[0_0_35px_rgba(168,85,247,0.12)]">
              <h2 className="text-2xl font-black glitch-text mb-5">
                Status da loja
              </h2>

              <div className="space-y-4">
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                  <p className="text-green-400 font-bold">🟢 Online</p>
                  <p className="text-zinc-400 text-sm">
                    Loja funcionando normalmente
                  </p>
                </div>

                <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                  <p className="text-purple-300 font-bold">
                    🔔 Telegram ativo
                  </p>
                  <p className="text-zinc-400 text-sm">
                    Novos pedidos chegam no bot
                  </p>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                  <p className="text-yellow-300 font-bold">💰 Pix manual</p>
                  <p className="text-zinc-400 text-sm">
                    Confirme pagamento pelo admin
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div id="opcoes-produto" className="neon-card rounded-3xl p-8 mb-8 border border-purple-500/20 shadow-[0_0_40px_rgba(168,85,247,0.14)]">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-black glitch-text">
                  🧩 Opções do Produto
                </h2>
                <p className="text-zinc-400 text-sm mt-1">
                  Crie e edite quantas opções quiser: 100 seguidores, 500
                  seguidores, 1000 seguidores etc.
                </p>
              </div>

              <span className="bg-black/40 px-4 py-2 rounded-xl">
                {productOptions.length} opções
              </span>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <div>
                <label className="text-sm font-bold text-zinc-400">
                  PRODUTO
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => {
                    setSelectedProductId(e.target.value);
                    cancelEditOption();
                  }}
                  className="input"
                >
                  <option value="">Selecione um produto</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>

                {selectedProduct && (
                  <div className="bg-black/40 border border-purple-500/30 rounded-2xl p-4 mb-4">
                    <p className="text-purple-300 font-bold">
                      Produto selecionado:
                    </p>
                    <p className="text-white">{selectedProduct.name}</p>
                  </div>
                )}

                {!editingOption && (
                  <>
                    <label className="text-sm font-bold text-zinc-400">
                      NOME DA OPÇÃO
                    </label>
                    <input
                      value={optionName}
                      onChange={(e) => setOptionName(e.target.value)}
                      placeholder="Ex: 1000 Seguidores"
                      className="input"
                    />

                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="text-sm font-bold text-zinc-400">
                          PREÇO DA OPÇÃO
                        </label>
                        <input
                          value={optionPrice}
                          onChange={(e) => setOptionPrice(e.target.value)}
                          placeholder="Ex: 9.99 ou 9,99"
                          className="input"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-bold text-zinc-400">
                          PREÇO ANTIGO
                        </label>
                        <input
                          value={optionOldPrice}
                          onChange={(e) => setOptionOldPrice(e.target.value)}
                          placeholder="Ex: 25.00 ou 25,00"
                          className="input"
                        />
                      </div>
                    </div>

                    <button
                      onClick={addProductOption}
                      className="w-full neon-button-strong py-4 rounded-xl font-bold mt-2"
                    >
                      ➕ ADICIONAR OPÇÃO
                    </button>
                  </>
                )}

                {editingOption && (
                  <div className="bg-black/40 border border-pink-500/30 rounded-2xl p-5">
                    <div className="flex justify-between items-center mb-5">
                      <div>
                        <h3 className="text-xl font-black text-pink-300">
                          ✏️ Editando opção
                        </h3>
                        <p className="text-zinc-400 text-sm">
                          Altere nome e preço da opção selecionada.
                        </p>
                      </div>

                      <button
                        onClick={cancelEditOption}
                        className="border border-red-500/40 text-red-300 px-4 py-2 rounded-xl font-bold hover:bg-red-600 hover:text-white transition"
                      >
                        Cancelar
                      </button>
                    </div>

                    <label className="text-sm font-bold text-zinc-400">
                      NOME DA OPÇÃO
                    </label>
                    <input
                      value={editOptionName}
                      onChange={(e) => setEditOptionName(e.target.value)}
                      className="input"
                    />

                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="text-sm font-bold text-zinc-400">
                          PREÇO DA OPÇÃO
                        </label>
                        <input
                          value={editOptionPrice}
                          onChange={(e) => setEditOptionPrice(e.target.value)}
                          placeholder="Ex: 9.99 ou 9,99"
                          className="input"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-bold text-zinc-400">
                          PREÇO ANTIGO
                        </label>
                        <input
                          value={editOptionOldPrice}
                          onChange={(e) =>
                            setEditOptionOldPrice(e.target.value)
                          }
                          placeholder="Ex: 25.00 ou 25,00"
                          className="input"
                        />
                      </div>
                    </div>

                    <button
                      onClick={updateProductOption}
                      className="w-full neon-button-strong py-4 rounded-xl font-bold mt-2"
                    >
                      💾 SALVAR OPÇÃO
                    </button>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-xl font-black mb-4">
                  Opções cadastradas
                </h3>

                <div className="space-y-4 max-h-[460px] overflow-y-auto pr-2">
                  {selectedProductId &&
                    selectedProductOptions.map((option) => (
                      <div
                        key={option.id}
                        className="bg-black/50 border border-white/10 rounded-3xl p-5 flex items-center justify-between hover:border-purple-500/50 hover:shadow-[0_0_25px_rgba(168,85,247,0.18)] transition"
                      >
                        <div>
                          <h4 className="font-black">{option.name}</h4>

                          <div className="flex gap-3 mt-1">
                            <p className="text-purple-300 font-bold">
                              R$ {Number(option.price).toFixed(2)}
                            </p>

                            {option.old_price && (
                              <p className="text-zinc-500 line-through">
                                R$ {Number(option.old_price).toFixed(2)}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => startEditOption(option)}
                            className="text-purple-300 text-xl hover:scale-125 transition"
                          >
                            ✏️
                          </button>

                          <button
                            onClick={() => deleteProductOption(option.id)}
                            className="text-red-400 text-xl hover:scale-125 transition"
                          >
                            🗑
                          </button>
                        </div>
                      </div>
                    ))}

                  {selectedProductId && selectedProductOptions.length === 0 && (
                    <p className="text-zinc-400 text-center py-8">
                      Nenhuma opção cadastrada para este produto.
                    </p>
                  )}

                  {!selectedProductId && (
                    <p className="text-zinc-400 text-center py-8">
                      Selecione um produto para ver as opções.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div id="novo-produto" className="neon-card rounded-3xl p-8 border border-purple-500/20 shadow-[0_0_35px_rgba(168,85,247,0.12)]">
              <h2 className="text-2xl font-bold mb-8 text-purple-300">
                + Novo Produto
              </h2>

              <label className="text-sm font-bold text-zinc-400">
                NOME DO PRODUTO
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Steam key aleatória"
                className="input"
              />

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="text-sm font-bold text-zinc-400">
                    PREÇO (R$)
                  </label>
                  <input
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00 ou 0,00"
                    className="input"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-zinc-400">
                    PREÇO ANTIGO
                  </label>
                  <input
                    value={oldPrice}
                    onChange={(e) => setOldPrice(e.target.value)}
                    placeholder="0.00 ou 0,00"
                    className="input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="text-sm font-bold text-zinc-400">
                    SERVIÇO
                  </label>
                  <select
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    className="input"
                  >
                    <option>Steam</option>
                    <option>Key</option>
                    <option>Conta</option>
                    <option>Gift Card</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-bold text-zinc-400">
                    ESTOQUE
                  </label>
                  <input
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="input"
                  />
                </div>
              </div>

              <label className="text-sm font-bold text-zinc-400">
                IMAGEM DO PRODUTO
              </label>
              <input
                type="file"
                accept="image/*"
                className="input"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadImage(file);
                }}
              />

              {imageUrl && (
                <p className="text-green-400 text-sm mb-4">
                  Imagem enviada com sucesso ✅
                </p>
              )}

              <label className="text-sm font-bold text-zinc-400">
                CATEGORIA
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input"
              >
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.toUpperCase()}
                  </option>
                ))}
              </select>

              <label className="text-sm font-bold text-zinc-400">
                DESCRIÇÃO
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detalhes do produto..."
                className="input h-28"
              />

              <label className="text-sm font-bold text-zinc-400">
                CONTEÚDO DA ENTREGA
              </label>
              <textarea
                value={deliveryContent}
                onChange={(e) => setDeliveryContent(e.target.value)}
                placeholder="Ex: KEY: XXXX-XXXX-XXXX ou LOGIN/SENHA"
                className="input h-28"
              />

              <button
                onClick={addProduct}
                className="w-full neon-button-strong py-4 rounded-xl font-bold mt-4"
              >
                📦 ADICIONAR PRODUTO
              </button>
            </div>

            <div className="neon-card rounded-3xl p-8 border border-purple-500/20 shadow-[0_0_35px_rgba(168,85,247,0.12)]">
              <div className="flex justify-between mb-8">
                <h2 className="text-2xl font-bold">📦 Produtos Ativos</h2>

                <span className="bg-black/40 px-4 py-2 rounded-xl">
                  {products.length} itens
                </span>
              </div>

              <div className="space-y-4 max-h-[760px] overflow-y-auto pr-2">
                {products.map((p) => (
                  <div
                    key={p.id}
                    className="bg-black/50 border border-white/10 rounded-3xl p-5 flex items-center justify-between hover:border-purple-500/50 hover:shadow-[0_0_25px_rgba(168,85,247,0.18)] transition"
                  >
                    <div className="flex gap-4 items-center">
                      <div className="w-16 h-16 rounded-xl bg-purple-700 flex items-center justify-center overflow-hidden">
                        {p.image_url ? (
                          <img
                            src={p.image_url}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          "🎮"
                        )}
                      </div>

                      <div>
                        <h3 className="font-bold">{p.name}</h3>

                        <p className="text-zinc-400">
                          R$ {Number(p.price).toFixed(2)} -{" "}
                          {p.category || p.service}
                        </p>

                        <span className="inline-block mt-2 text-xs bg-purple-600/20 border border-purple-500/30 text-purple-300 px-2 py-1 rounded-full">
                          {(p.category || "sem categoria").toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-3 items-center">
                      <button
                        onClick={() => startEditProduct(p)}
                        className="text-purple-300 text-xl hover:scale-125 transition"
                      >
                        ✏️
                      </button>

                      <button
                        onClick={() => deleteProduct(p.id)}
                        className="text-red-400 text-xl hover:scale-125 transition"
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                ))}

                {products.length === 0 && (
                  <p className="text-zinc-400 text-center">
                    Nenhum produto cadastrado.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
      <style jsx>{`
        @keyframes admin-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        .neon-card:hover {
          box-shadow: 0 0 35px rgba(168, 85, 247, 0.18);
        }

        input, textarea, select {
          transition: 0.2s ease;
        }

        input:focus, textarea:focus, select:focus {
          box-shadow: 0 0 0 1px rgba(168, 85, 247, 0.55), 0 0 28px rgba(168, 85, 247, 0.20);
        }
      `}</style>

    </main>
  );
}
