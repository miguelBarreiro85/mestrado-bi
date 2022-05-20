USE [electroPT]
GO

/****** Object:  Table [dbo].[categoria]    Script Date: 10/05/2022 08:20:11 ******/
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[categoria]') AND type in (N'U'))
DROP TABLE [dbo].[categoria]
GO

/****** Object:  Table [dbo].[categoria]    Script Date: 10/05/2022 08:20:11 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[categoria](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[designacao] [varchar](50) NOT NULL,
	[id_categoria_pai] [int],
 CONSTRAINT [PK_categoria] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[categoria]  WITH CHECK ADD  CONSTRAINT [FK_categoria_idcategoriapai] FOREIGN KEY([id_categoria_pai])
REFERENCES [dbo].[categoria] ([id])
GO

ALTER TABLE [dbo].[categoria] CHECK CONSTRAINT [FK_categoria_idcategoriapai]
GO


