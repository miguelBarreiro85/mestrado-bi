
USE [electroPT]
GO

/****** Object:  Table [dbo].[categoria]    Script Date: 10/05/2022 08:20:11 ******/
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[linha_compra]') AND type in (N'U'))
DROP TABLE [dbo].[linha_compra]
GO

/****** Object:  Table [dbo].[categoria]    Script Date: 10/05/2022 08:20:11 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[linha_compra](
	[id] [int] IDENTITY(1,1) NOT NULL,
    [id_compra] [int] NOT NULL,
	[id_produto] [int] NOT NULL,
	[quantidade] [float] NOT NULL,
	[preco_unit] [float] NOT NULL,
    [preco_unit_iva] [float] NOT NULL,
	CONSTRAINT [PK_linha_compra] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[linha_compra]  WITH CHECK ADD  CONSTRAINT [FK_linha_compra_idcompra] FOREIGN KEY([id_compra])
REFERENCES [dbo].[compra] ([id])
GO

ALTER TABLE [dbo].[linha_compra]  WITH CHECK ADD  CONSTRAINT [FK_linha_compra_idproduto] FOREIGN KEY([id_produto])
REFERENCES [dbo].[produto] ([id])
GO

ALTER TABLE [dbo].[linha_compra] CHECK CONSTRAINT [FK_linha_compra_idcompra]
GO

ALTER TABLE [dbo].[linha_compra] CHECK CONSTRAINT [FK_linha_compra_idproduto]
GO