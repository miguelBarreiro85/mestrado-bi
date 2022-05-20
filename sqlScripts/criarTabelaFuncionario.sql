
USE [electroPT]
GO

/****** Object:  Table [dbo].[categoria]    Script Date: 10/05/2022 08:20:11 ******/
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[funcionario]') AND type in (N'U'))
DROP TABLE [dbo].[funcionario]
GO

/****** Object:  Table [dbo].[categoria]    Script Date: 10/05/2022 08:20:11 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[funcionario](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[id_pessoa] [int] NOT NULL,
	[preco_hora] [float] NOT NULL,
	[ordenado_mensal] [float] NOT NULL,
	CONSTRAINT [PK_funcionario] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[funcionario]  WITH CHECK ADD  CONSTRAINT [FK_funcionario_idpessoa] FOREIGN KEY([id_pessoa])
REFERENCES [dbo].[pessoa] ([id])
GO

ALTER TABLE [dbo].[funcionario] CHECK CONSTRAINT [FK_funcionario_idpessoa]
GO