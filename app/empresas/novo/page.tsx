"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { ArrowLeft, Building2, FileCheck, MapPin, Phone, FileText, Save, Loader2, Upload, X, Plus, Search } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { UserMenu } from "@/components/user-menu"
import { buscarDadosCNPJ, BrasilAPIError } from "@/lib/brasilapi"

const ESTADOS_BRASIL = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
]

export default function NovaEmpresaPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("identificacao")
  const [loading, setLoading] = useState(false)
  const [buscandoCNPJ, setBuscandoCNPJ] = useState(false)

  const { user } = useAuth()
  const userUID = user?.uid

  const [formData, setFormData] = useState({
    razaoSocial: "",
    nomeFantasia: "",
    cnpj: "",
    segmento: "",
    cidadeSede: "",
    cnaePrincipal: { codigo: "", descricao: "" },
    endereco: {
      logradouro: "",
      numero: "",
      complemento: "",
      cep: "",
      bairro: "",
      municipio: "",
      uf: ""
    },
    contato: {
      email: "",
      telefone: "",
      telefoneSecundario: ""
    },
    situacaoCadastral: "Ativa",
    dataSituacaoCadastral: new Date().toISOString().split('T')[0],
    cnaesSecundarios: [] as Array<{ codigo: string; descricao: string }>
  })

  const [cartaoCNPJ, setCartaoCNPJ] = useState<File | null>(null)
  const [novoCNAE, setNovoCNAE] = useState({ codigo: "", descricao: "" })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  const handleEnderecoChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      endereco: { ...formData.endereco, [field]: value }
    })
  }

  const handleContatoChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      contato: { ...formData.contato, [field]: value }
    })
  }

  const handleCNAEPrincipalChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      cnaePrincipal: { ...formData.cnaePrincipal, [field]: value }
    })
  }

  const adicionarCNAESecundario = () => {
    if (novoCNAE.codigo && novoCNAE.descricao) {
      setFormData({
        ...formData,
        cnaesSecundarios: [...formData.cnaesSecundarios, novoCNAE]
      })
      setNovoCNAE({ codigo: "", descricao: "" })
      toast.success("CNAE adicionado!")
    } else {
      toast.error("Preencha código e descrição do CNAE")
    }
  }

  const removerCNAESecundario = (index: number) => {
    setFormData({
      ...formData,
      cnaesSecundarios: formData.cnaesSecundarios.filter((_, i) => i !== index)
    })
    toast.success("CNAE removido!")
  }

  const handleBuscarCNPJ = async () => {
    if (!formData.cnpj || formData.cnpj.trim() === '') {
      toast.error('Digite um CNPJ para buscar')
      return
    }

    setBuscandoCNPJ(true)

    try {
      const dados = await buscarDadosCNPJ(formData.cnpj)

      // Preencher todos os campos do formulário
      setFormData({
        razaoSocial: dados.identificacao.razaoSocial,
        nomeFantasia: dados.identificacao.nomeFantasia,
        cnpj: dados.identificacao.cnpj,
        segmento: dados.identificacao.segmento,
        cidadeSede: dados.identificacao.cidadeSede,
        cnaePrincipal: dados.atividadesEconomicas.principal,
        endereco: dados.endereco,
        contato: {
          email: dados.contatoStatus.email,
          telefone: dados.contatoStatus.telefone1,
          telefoneSecundario: dados.contatoStatus.telefone2
        },
        situacaoCadastral: dados.contatoStatus.situacaoCadastral,
        dataSituacaoCadastral: dados.contatoStatus.dataSituacaoCadastral || new Date().toISOString().split('T')[0],
        cnaesSecundarios: dados.atividadesEconomicas.secundarias
      })

      toast.success('Dados da empresa carregados com sucesso!')

      // Opcional: mudar para a próxima tab
      // setActiveTab('endereco')

    } catch (error) {
      if (error instanceof BrasilAPIError) {
        toast.error(error.message)
      } else {
        toast.error('Erro ao buscar dados do CNPJ')
        console.error(error)
      }
    } finally {
      setBuscandoCNPJ(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data = new FormData()

      data.append('razaoSocial', formData.razaoSocial)
      data.append('nomeFantasia', formData.nomeFantasia)
      data.append('cnpj', formData.cnpj)
      data.append('segmento', formData.segmento)
      data.append('cidadeSede', formData.cidadeSede)
      data.append('cnaePrincipal', JSON.stringify(formData.cnaePrincipal))
      data.append('endereco', JSON.stringify(formData.endereco))
      data.append('contato', JSON.stringify(formData.contato))
      data.append('situacaoCadastral', formData.situacaoCadastral)
      data.append('dataSituacaoCadastral', formData.dataSituacaoCadastral)
      data.append('cnaesSecundarios', JSON.stringify(formData.cnaesSecundarios))
      data.append('donoUid', userUID || '')

      if (cartaoCNPJ) {
        data.append('cartaoCNPJ', cartaoCNPJ)
      }

      const response = await fetch("http://localhost:3001/api/empresas", {
        method: "POST",
        body: data
      })

      if (response.ok) {
        toast.success("Empresa cadastrada com sucesso!")
        router.push("/empresas")
      } else {
        const error = await response.json()
        throw new Error(error.error || "Erro ao cadastrar empresa")
      }
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2">
                <FileCheck className="h-7 w-7 text-primary" />
                <h1 className="text-2xl font-semibold text-foreground">DocLicitante</h1>
              </Link>
            </div>
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-border bg-card">
        <div className="container mx-auto px-6">
          <div className="flex gap-6">
            <Link href="/" className="py-3 px-1 border-b-2 border-transparent text-sm font-medium text-muted-foreground hover:text-foreground">
              Inicial
            </Link>
            <Link href="/empresas" className="py-3 px-1 border-b-2 border-primary text-sm font-medium text-foreground">
              Minhas Empresas
            </Link>
            <Link href="/solicitacoes" className="py-3 px-1 border-b-2 border-transparent text-sm font-medium text-muted-foreground hover:text-foreground">
              Solicitações
            </Link>
            <Link href="/notificacoes" className="py-3 px-1 border-b-2 border-transparent text-sm font-medium text-muted-foreground hover:text-foreground">
              Notificações
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <Link href="/empresas">
            <Button variant="ghost" className="gap-2 mb-4 -ml-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar para Empresas
            </Button>
          </Link>
          <h2 className="text-3xl font-semibold text-foreground mb-2">Nova Empresa</h2>
          <p className="text-muted-foreground">Preencha os dados completos da empresa para o sistema</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 gap-2 h-auto bg-transparent p-0">
              <TabsTrigger
                value="identificacao"
                className="data-[state=active]:bg-card data-[state=active]:border-primary border-2 border-transparent flex items-center gap-2 py-3"
              >
                <Building2 className="h-4 w-4" />
                <span className="hidden sm:inline">Identificação</span>
              </TabsTrigger>
              <TabsTrigger
                value="endereco"
                className="data-[state=active]:bg-card data-[state=active]:border-primary border-2 border-transparent flex items-center gap-2 py-3"
              >
                <MapPin className="h-4 w-4" />
                <span className="hidden sm:inline">Endereço</span>
              </TabsTrigger>
              <TabsTrigger
                value="contato"
                className="data-[state=active]:bg-card data-[state=active]:border-primary border-2 border-transparent flex items-center gap-2 py-3"
              >
                <Phone className="h-4 w-4" />
                <span className="hidden sm:inline">Contato</span>
              </TabsTrigger>
              <TabsTrigger
                value="cnae"
                className="data-[state=active]:bg-card data-[state=active]:border-primary border-2 border-transparent flex items-center gap-2 py-3"
              >
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">CNAE</span>
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Identificação */}
            <TabsContent value="identificacao">
              <Card>
                <CardHeader>
                  <CardTitle>Dados de Identificação</CardTitle>
                  <CardDescription>Informações básicas da empresa</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="razaoSocial">Razão Social <span className="text-destructive">*</span></Label>
                      <Input id="razaoSocial" placeholder="Nome completo da empresa" required value={formData.razaoSocial} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
                      <Input id="nomeFantasia" placeholder="Nome fantasia (opcional)" value={formData.nomeFantasia} onChange={handleChange} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="cnpj">CNPJ <span className="text-destructive">*</span></Label>
                      <div className="flex gap-2">
                        <Input
                          id="cnpj"
                          placeholder="00.000.000/0000-00"
                          required
                          value={formData.cnpj}
                          onChange={handleChange}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleBuscarCNPJ}
                          disabled={buscandoCNPJ || !formData.cnpj}
                          className="shrink-0"
                        >
                          {buscandoCNPJ ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Search className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Digite o CNPJ e clique no botão de busca para preencher automaticamente
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="segmento">Segmento / Categoria</Label>
                      <Input id="segmento" placeholder="Ex: Construção Civil" value={formData.segmento} onChange={handleChange} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cidadeSede">Cidade Sede</Label>
                    <Input id="cidadeSede" placeholder="Cidade" value={formData.cidadeSede} onChange={handleChange} />
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">CNAE Principal</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="cnaePrincipalCodigo">Código</Label>
                        <Input
                          id="cnaePrincipalCodigo"
                          placeholder="0000-0/00"
                          value={formData.cnaePrincipal.codigo}
                          onChange={(e) => handleCNAEPrincipalChange("codigo", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cnaePrincipalDescricao">Descrição</Label>
                        <Input
                          id="cnaePrincipalDescricao"
                          placeholder="Descrição da atividade principal"
                          value={formData.cnaePrincipal.descricao}
                          onChange={(e) => handleCNAEPrincipalChange("descricao", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cartaoCNPJ">Cartão CNPJ <span className="text-destructive">*</span></Label>
                    <div className="flex gap-2">
                      <Input
                        id="cartaoCNPJ"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setCartaoCNPJ(e.target.files[0])
                          }
                        }}
                        className="flex-1"
                      />
                      {cartaoCNPJ && (
                        <Badge variant="outline" className="shrink-0 flex items-center gap-1">
                          <Upload className="h-3 w-3" />
                          {cartaoCNPJ.name}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Formatos aceitos: PDF, JPG, PNG (máx. 5MB)</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 2: Endereço */}
            <TabsContent value="endereco">
              <Card>
                <CardHeader>
                  <CardTitle>Endereço</CardTitle>
                  <CardDescription>Endereço completo da empresa</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="logradouro">Logradouro</Label>
                      <Input
                        id="logradouro"
                        placeholder="Rua, Avenida, etc."
                        value={formData.endereco.logradouro}
                        onChange={(e) => handleEnderecoChange("logradouro", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="numero">Número</Label>
                      <Input
                        id="numero"
                        placeholder="Nº"
                        value={formData.endereco.numero}
                        onChange={(e) => handleEnderecoChange("numero", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="complemento">Complemento</Label>
                      <Input
                        id="complemento"
                        placeholder="Apto, Sala, etc."
                        value={formData.endereco.complemento}
                        onChange={(e) => handleEnderecoChange("complemento", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cep">CEP</Label>
                      <Input
                        id="cep"
                        placeholder="00000-000"
                        value={formData.endereco.cep}
                        onChange={(e) => handleEnderecoChange("cep", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="bairro">Bairro/Distrito</Label>
                      <Input
                        id="bairro"
                        placeholder="Bairro"
                        value={formData.endereco.bairro}
                        onChange={(e) => handleEnderecoChange("bairro", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="municipio">Município</Label>
                      <Input
                        id="municipio"
                        placeholder="Cidade"
                        value={formData.endereco.municipio}
                        onChange={(e) => handleEnderecoChange("municipio", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="uf">UF</Label>
                      <Select value={formData.endereco.uf} onValueChange={(value) => handleEnderecoChange("uf", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent>
                          {ESTADOS_BRASIL.map(estado => (
                            <SelectItem key={estado} value={estado}>{estado}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 3: Contato */}
            <TabsContent value="contato">
              <Card>
                <CardHeader>
                  <CardTitle>Contato e Situação Cadastral</CardTitle>
                  <CardDescription>Informações de contato e status da empresa</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="email">Endereço Eletrônico (E-mail)</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="contato@empresa.com.br"
                        value={formData.contato.email}
                        onChange={(e) => handleContatoChange("email", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telefone">Telefone</Label>
                      <Input
                        id="telefone"
                        placeholder="(00) 00000-0000"
                        value={formData.contato.telefone}
                        onChange={(e) => handleContatoChange("telefone", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefoneSecundario">Telefone Secundário (Opcional)</Label>
                    <Input
                      id="telefoneSecundario"
                      placeholder="(00) 00000-0000"
                      value={formData.contato.telefoneSecundario}
                      onChange={(e) => handleContatoChange("telefoneSecundario", e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="situacaoCadastral">Situação Cadastral</Label>
                      <Select value={formData.situacaoCadastral} onValueChange={(value) => setFormData({ ...formData, situacaoCadastral: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Ativa">Ativa</SelectItem>
                          <SelectItem value="Suspensa">Suspensa</SelectItem>
                          <SelectItem value="Inapta">Inapta</SelectItem>
                          <SelectItem value="Baixada">Baixada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dataSituacaoCadastral">Data da Situação Cadastral</Label>
                      <Input
                        id="dataSituacaoCadastral"
                        type="date"
                        value={formData.dataSituacaoCadastral}
                        onChange={(e) => setFormData({ ...formData, dataSituacaoCadastral: e.target.value })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 4: CNAE */}
            <TabsContent value="cnae">
              <Card>
                <CardHeader>
                  <CardTitle>CNAEs Secundários</CardTitle>
                  <CardDescription>Códigos e descrições das atividades econômicas secundárias</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex-1 space-y-2">
                        <Label htmlFor="novoCNAECodigo">Código CNAE</Label>
                        <Input
                          id="novoCNAECodigo"
                          placeholder="0000-0/00"
                          value={novoCNAE.codigo}
                          onChange={(e) => setNovoCNAE({ ...novoCNAE, codigo: e.target.value })}
                        />
                      </div>
                      <div className="flex-[2] space-y-2">
                        <Label htmlFor="novoCNAEDescricao">Descrição</Label>
                        <Input
                          id="novoCNAEDescricao"
                          placeholder="Descrição da atividade"
                          value={novoCNAE.descricao}
                          onChange={(e) => setNovoCNAE({ ...novoCNAE, descricao: e.target.value })}
                        />
                      </div>
                      <div className="flex items-end">
                        <Button type="button" onClick={adicionarCNAESecundario} className="gap-2">
                          <Plus className="h-4 w-4" />
                          Adicionar
                        </Button>
                      </div>
                    </div>

                    {formData.cnaesSecundarios.length > 0 && (
                      <div className="space-y-2">
                        <Label>CNAEs Adicionados</Label>
                        <div className="space-y-2">
                          {formData.cnaesSecundarios.map((cnae, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 border border-border rounded-lg">
                              <div className="flex-1">
                                <p className="text-sm font-medium">{cnae.codigo}</p>
                                <p className="text-xs text-muted-foreground">{cnae.descricao}</p>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removerCNAESecundario(index)}
                                className="text-destructive hover:text-destructive"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {formData.cnaesSecundarios.length === 0 && (
                      <div className="text-center py-8 text-sm text-muted-foreground">
                        Nenhum CNAE secundário adicionado ainda.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end mt-8">
            <Link href="/empresas">
              <Button type="button" variant="outline" className="bg-transparent">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={loading} className="gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Salvar Empresa
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
