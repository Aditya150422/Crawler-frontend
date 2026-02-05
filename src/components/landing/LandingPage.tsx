"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Zap,
  Globe,
  MessageSquare,
  Search,
  Database,
  Shield,
  ArrowRight,
  Sparkles,
  Brain,
  Layers,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui";

const features = [
  {
    icon: Globe,
    title: "Smart Web Crawling",
    description:
      "Intelligently crawl any website with configurable depth and page limits. Our AI-powered crawler respects robots.txt and handles dynamic content.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Brain,
    title: "AI-Powered Embeddings",
    description:
      "Transform scraped content into semantic embeddings using state-of-the-art language models for intelligent search and retrieval.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: MessageSquare,
    title: "Conversational AI",
    description:
      "Chat naturally with your scraped data. Ask questions and get accurate answers with source citations from your knowledge base.",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: Search,
    title: "Semantic Search",
    description:
      "Find exactly what you need with semantic search that understands context and meaning, not just keywords.",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: Database,
    title: "Vector Storage",
    description:
      "Efficiently store and manage your embeddings with our optimized vector database for lightning-fast retrieval.",
    color: "from-indigo-500 to-purple-500",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description:
      "Your data stays yours. Enterprise-grade security with encrypted storage and secure API access.",
    color: "from-rose-500 to-pink-500",
  },
];

const stats = [
  { label: "Websites Scraped", value: "10K+" },
  { label: "Pages Processed", value: "1M+" },
  { label: "AI Conversations", value: "500K+" },
  { label: "Active Users", value: "5K+" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-radial from-primary-500/20 via-transparent to-transparent blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-radial from-accent-purple/20 via-transparent to-transparent blur-3xl animate-pulse-slow" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-cyan flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">WebScrapper AI</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" size="md">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="primary" size="md">
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 pt-20 pb-32">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 mb-8">
              <Sparkles className="w-4 h-4 text-primary-400" />
              <span className="text-sm text-primary-300">
                Powered by Advanced AI Technology
              </span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold leading-tight mb-6"
          >
            <span className="text-white">Transform Any Website Into</span>
            <br />
            <span className="text-gradient">Your AI Knowledge Base</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-gray-400 max-w-3xl mx-auto mb-12"
          >
            Scrape, index, and chat with any website using AI. Build powerful
            knowledge bases from web content and get instant answers with
            source citations.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/signup">
              <Button variant="primary" size="lg" className="min-w-[200px]">
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="lg" className="min-w-[200px]">
                View Demo
                <Layers className="w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Hero Visual */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-5xl mx-auto mt-20"
        >
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 via-accent-purple/20 to-accent-cyan/20 blur-3xl" />
            
            {/* Dashboard preview card */}
            <div className="relative glass rounded-2xl p-1">
              <div className="bg-dark-900/80 rounded-xl overflow-hidden">
                {/* Mock browser bar */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-dark-700">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="bg-dark-800 rounded-lg px-4 py-1.5 text-sm text-gray-400 max-w-md">
                      https://app.webscrapper.ai/dashboard
                    </div>
                  </div>
                </div>
                
                {/* Mock dashboard content */}
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-4 gap-4">
                    {stats.map((stat, i) => (
                      <div
                        key={i}
                        className="bg-dark-800/50 rounded-xl p-4 text-center"
                      >
                        <div className="text-2xl font-bold text-gradient">
                          {stat.value}
                        </div>
                        <div className="text-sm text-gray-500">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-4 h-32">
                    <div className="col-span-2 bg-dark-800/50 rounded-xl p-4 flex items-center justify-center">
                      <div className="text-gray-600 text-sm">
                        Interactive Dashboard Preview
                      </div>
                    </div>
                    <div className="bg-dark-800/50 rounded-xl p-4 flex items-center justify-center">
                      <div className="text-gray-600 text-sm">AI Chat</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 px-6 py-32 bg-dark-900/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Everything You Need to Build AI Knowledge Bases
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Powerful features designed to help you extract, process, and
              interact with web content using AI.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <div className="h-full p-6 bg-dark-800/30 border border-dark-700/50 rounded-2xl hover:border-primary-500/30 transition-all duration-300">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative z-10 px-6 py-32">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Get started in minutes with our simple three-step process.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Enter URL",
                description:
                  "Simply paste the URL of any website you want to scrape and configure your crawling options.",
                icon: Globe,
              },
              {
                step: "02",
                title: "AI Processing",
                description:
                  "Our AI automatically crawls, extracts content, and creates semantic embeddings for intelligent search.",
                icon: Brain,
              },
              {
                step: "03",
                title: "Chat & Search",
                description:
                  "Ask questions and get instant answers with source citations from your new knowledge base.",
                icon: MessageSquare,
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {index < 2 && (
                  <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-px bg-gradient-to-r from-primary-500/50 to-transparent">
                    <ChevronRight className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-500" />
                  </div>
                )}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-cyan mb-4">
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-sm text-primary-400 font-mono mb-2">
                    Step {item.step}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-400">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-32">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 via-accent-purple/20 to-accent-cyan/20 blur-3xl" />
            <div className="relative glass rounded-3xl p-12 text-center">
              <h2 className="text-4xl font-bold text-white mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
                Join thousands of users who are already transforming websites
                into intelligent, searchable knowledge bases.
              </p>
              <Link href="/signup">
                <Button variant="primary" size="lg">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 border-t border-dark-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-cyan flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-white">WebScrapper AI</span>
          </div>
          <p className="text-gray-500 text-sm">
            © 2026 WebScrapper AI. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="#"
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              Privacy
            </Link>
            <Link
              href="#"
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              Terms
            </Link>
            <Link
              href="#"
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
