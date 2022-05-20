USE [electroPT]
GO

/****** Object:  Table [dbo].[categoria]    Script Date: 10/05/2022 08:20:11 ******/
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[pessoa]') AND type in (N'U'))
DROP TABLE [dbo].[pessoa]
GO

/****** Object:  Table [dbo].[categoria]    Script Date: 10/05/2022 08:20:11 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[pessoa](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[primeiro_nome] [varchar](50) NOT NULL,
	[ultimo_nome] [varchar](50) NOT NULL,
	[contacto] [varchar](13) NOT NULL,
	[nif] [varchar](9),
	[genero] [varchar](10),
	[email] [varchar](50),
	[data_nasc] [date],
	[id_codigo_postal] [int] NOT NULL
	CONSTRAINT [PK_pessoa] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[pessoa]  WITH CHECK ADD  CONSTRAINT [FK_pessoa_idcodigopostal] FOREIGN KEY([id_codigo_postal])
REFERENCES [dbo].[codigo_postal] ([id])
GO

ALTER TABLE [dbo].[pessoa] CHECK CONSTRAINT [FK_pessoa_idcodigopostal]
GO