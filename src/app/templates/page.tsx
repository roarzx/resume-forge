import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TEMPLATES, type TemplateType } from "@/types/resume";
import { ArrowRight, Check } from "lucide-react";

export default function TemplatesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="py-16 sm:py-24 text-center">
          <div className="container px-4 mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              选择你的专属模板
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
              精心设计的专业模板，适配不同行业和岗位，让你的简历独具风格
            </p>
            <Link href="/register">
              <Button size="lg" className="gap-2">
                免费使用
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Templates Grid */}
        <section className="py-12 bg-muted/50">
          <div className="container px-4 mx-auto">
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {TEMPLATES.map((template) => (
                <Card key={template.id} className="overflow-hidden">
                  <div className="aspect-[3/4] bg-white p-4 flex items-center justify-center border-b">
                    <div className="w-full max-w-[200px] bg-white shadow-lg rounded">
                      <TemplatePreview type={template.id} />
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle>{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      {template.id === "classic" && (
                        <>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            传统单栏布局
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            稳重专业风格
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            适合国企/传统行业
                          </li>
                        </>
                      )}
                      {template.id === "modern" && (
                        <>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            双栏分区设计
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            活力现代风格
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            适合互联网/科技
                          </li>
                        </>
                      )}
                      {template.id === "minimal" && (
                        <>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            极简无边框
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            优雅轻盈
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            适合创意/设计
                          </li>
                        </>
                      )}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 text-center">
          <div className="container px-4 mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              准备好开始了吗？
            </h2>
            <p className="text-muted-foreground mb-6">
              免费注册，选择模板，开始制作你的专业简历
            </p>
            <Link href="/register">
              <Button size="lg" className="gap-2">
                立即开始
                <ArrowRight className="h-4 w-4" />
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

function TemplatePreview({ type }: { type: TemplateType }) {
  return (
    <div className="p-3 text-xs font-sans">
      {type === "classic" && (
        <div className="space-y-2">
          <div className="h-4 bg-gray-900 rounded w-3/4" />
          <div className="h-2 bg-gray-400 rounded w-1/2" />
          <div className="h-2 bg-gray-300 rounded w-full" />
          <div className="h-px bg-gray-300 my-2" />
          <div className="space-y-1">
            <div className="h-2 bg-gray-400 rounded w-1/4" />
            <div className="h-1 bg-gray-200 rounded w-full" />
            <div className="h-1 bg-gray-200 rounded w-3/4" />
          </div>
          <div className="space-y-1 mt-2">
            <div className="h-2 bg-gray-400 rounded w-1/4" />
            <div className="h-1 bg-gray-200 rounded w-full" />
            <div className="h-1 bg-gray-200 rounded w-2/3" />
          </div>
        </div>
      )}
      {type === "modern" && (
        <div className="flex">
          <div className="w-1/3 bg-slate-900 p-2 text-white space-y-2">
            <div className="h-3 bg-white rounded w-3/4" />
            <div className="h-1 bg-slate-600 rounded w-full" />
            <div className="space-y-1 mt-2">
              <div className="h-1 bg-slate-600 rounded w-full" />
              <div className="h-1 bg-slate-600 rounded w-2/3" />
            </div>
          </div>
          <div className="w-2/3 p-2 space-y-2">
            <div className="h-2 bg-slate-900 rounded w-1/3" />
            <div className="h-1 bg-gray-300 rounded w-full" />
            <div className="h-1 bg-gray-200 rounded w-3/4" />
            <div className="h-2 bg-slate-900 rounded w-1/3 mt-2" />
            <div className="h-1 bg-gray-300 rounded w-full" />
          </div>
        </div>
      )}
      {type === "minimal" && (
        <div className="space-y-2 text-center">
          <div className="h-5 bg-gray-900 rounded w-2/3 mx-auto" />
          <div className="h-2 bg-gray-400 rounded w-1/2 mx-auto" />
          <div className="h-1 bg-gray-300 rounded w-full mt-3" />
          <div className="h-1 bg-gray-200 rounded w-3/4 mx-auto" />
          <div className="space-y-1 mt-3">
            <div className="h-2 bg-gray-900 rounded w-1/4 text-left" />
            <div className="h-1 bg-gray-200 rounded w-full" />
          </div>
        </div>
      )}
    </div>
  );
}
