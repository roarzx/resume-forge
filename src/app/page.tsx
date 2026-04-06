import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { FileText, ArrowRight, Check, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 sm:py-32">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500/20 rounded-full blur-2xl" />
            <div className="absolute bottom-0 -right-4 w-72 h-72 bg-blue-500/20 rounded-full blur-2xl" />
          </div>

          <div className="container px-4 mx-auto">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium rounded-full bg-primary/10 text-primary">
                <Sparkles className="w-4 h-4" />
                简单、专业、有格调
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                让简历制作变得
                <span className="text-primary"> 轻松简单</span>
              </h1>

              <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                告别繁琐的文档编辑，选择精美模板，轻松创建专业简历。
                实时预览、一键导出，让你的求职之路更加顺畅。
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/register">
                  <Button size="lg" className="gap-2">
                    开始制作
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/templates">
                  <Button size="lg" variant="outline" className="gap-2">
                    查看模板
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-muted/50">
          <div className="container px-4 mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                为什么选择简历工坊？
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                我们专注于提供最好的简历制作体验
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <FeatureCard
                icon={<FileText className="w-6 h-6" />}
                title="精美模板"
                description="精心设计的专业模板，适配各行各业，让你的简历脱颖而出"
              />
              <FeatureCard
                icon={<Sparkles className="w-6 h-6" />}
                title="实时预览"
                description="编辑与预览同步进行，所见即所得，无需猜测最终效果"
              />
              <FeatureCard
                icon={<Check className="w-6 h-6" />}
                title="一键导出"
                description="支持 PDF 格式导出，高质量输出，可直接投递"
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24">
          <div className="container px-4 mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              准备好打造你的专业简历了吗？
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
              免费注册，立即开始制作你的专属简历
            </p>
            <Link href="/register">
              <Button size="lg" className="gap-2">
                立即开始
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container px-4 mx-auto text-center text-muted-foreground">
          <p>简历工坊 © 2026. 让求职更简单。</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-background p-8 rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
      <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
