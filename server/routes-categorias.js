// // ===== ROTAS DE CATEGORIAS CUSTOMIZADAS =====
// // Adicionar estas rotas no server/index.js após a rota de custom-docs (linha ~545)

// // Criar nova categoria para uma empresa
// app.post('/api/empresas/:id/categorias', async (req, res) => {
//     const { id: empresaId } = req.params;
//     const { nome } = req.body;

//     console.log('📂 [BACKEND] Criando nova categoria:', { empresaId, nome });

//     try {
//         if (!nome || !nome.trim()) {
//             return res.status(400).json({ error: 'Nome da categoria é obrigatório.' });
//         }

//         // Verificar se já existe categoria com esse nome para esta empresa
//         const existingCat = await db.collection('categorias')
//             .where('empresaId', '==', empresaId)
//             .where('nome', '==', nome.trim())
//             .get();

//         if (!existingCat.empty) {
//             console.warn('⚠️ [BACKEND] Categoria já existe:', nome);
//             return res.status(400).json({ error: 'Já existe uma categoria com este nome.' });
//         }

//         const categoriaData = {
//             empresaId,
//             nome: nome.trim(),
//             customizada: true,
//             createdAt: admin.firestore.FieldValue.serverTimestamp()
//         };

//         const catRef = await db.collection('categorias').add(categoriaData);
//         console.log('✅ [BACKEND] Categoria criada com ID:', catRef.id);

//         res.status(201).json({
//             id: catRef.id,
//             ...categoriaData,
//             message: 'Categoria criada com sucesso.'
//         });
//     } catch (error) {
//         console.error('❌ [BACKEND] Erro ao criar categoria:', error);
//         res.status(500).json({ error: error.message });
//     }
// });

// // Listar categorias de uma empresa (padrões + customizadas)
// app.get('/api/empresas/:id/categorias', async (req, res) => {
//     const { id: empresaId } = req.params;

//     try {
//         // Categorias padrões (sempre disponíveis)
//         const categoriasPadrao = [
//             'Habilitação Jurídica',
//             'Regularidade Fiscal/Trabalhista',
//             'Qualificação Técnica',
//             'Qualificação Econômico-Financeira',
//             'Documentação Societária',
//             'Outros Documentos'
//         ];

//         // Buscar categorias customizadas
//         const snapshot = await db.collection('categorias')
//             .where('empresaId', '==', empresaId)
//             .get();

//         const categoriasCustomizadas = [];
//         snapshot.forEach(doc => {
//             categoriasCustomizadas.push({
//                 id: doc.id,
//                 ...doc.data()
//             });
//         });

//         console.log('📂 [BACKEND] Categorias encontradas:', {
//             padrao: categoriasPadrao.length,
//             customizadas: categoriasCustomizadas.length
//         });

//         res.json({
//             padrao: categoriasPadrao,
//             customizadas: categoriasCustomizadas,
//             todas: [...categoriasPadrao, ...categoriasCustomizadas.map(c => c.nome)]
//         });
//     } catch (error) {
//         console.error('❌ [BACKEND] Erro ao listar categorias:', error);
//         res.status(500).json({ error: error.message });
//     }
// });
