import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import ProductDetail from "@/pages/product-detail";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { useState, useEffect } from "react";
import { useGeoLocation } from "./hooks/useGeoLocation";

export type Filter = {
  brands: number[];
  categories: number[];
  colors: number[];
  sizes: string[];
  priceRange: [number, number];
  search: string;
};

function Router() {
  const location = useGeoLocation();
  const [filters, setFilters] = useState<Filter>({
    brands: [],
    categories: [],
    colors: [],
    sizes: [],
    priceRange: [0, 500],
    search: "",
  });

  const updateFilters = (newFilters: Partial<Filter>) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      ...newFilters
    }));
  };
  
  // Add UK flag pattern to body when user is from UK
  useEffect(() => {
    if (location.isUK) {
      document.body.classList.add('uk-user');
    } else {
      document.body.classList.remove('uk-user');
    }
  }, [location.isUK]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header filters={filters} updateFilters={updateFilters} />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={() => (
            <Home 
              filters={filters} 
              updateFilters={updateFilters} 
              country={location.country}
              isUK={location.isUK}
            />
          )} />
          <Route path="/product/:id" component={ProductDetail} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
