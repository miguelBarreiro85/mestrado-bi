USE [electroPT]
GO

/****** Object:  Table [dbo].[categoria]    Script Date: 11/05/2022 19:25:35 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[produto](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[designacao] [varchar](50) NOT NULL,
	[marca] [varchar](50) NOT NULL,
	[ean] [varchar](50) NOT NULL,
	[numero_serie] [varchar](50) NOT NULL,
	[taxa_iva] [float] NOT NULL,
	[id_categoria] [int] NOT NULL,
 CONSTRAINT [PK_produto] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[produto]  WITH CHECK ADD  CONSTRAINT [FK_produtos_idcategoria] FOREIGN KEY([id_categoria])
REFERENCES [dbo].[categoria] ([id])
GO

ALTER TABLE [dbo].[produto] CHECK CONSTRAINT [FK_produtos_idcategoria]
GO
